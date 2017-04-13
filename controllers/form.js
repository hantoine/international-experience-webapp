var express = require('express');
var form = require('../models/form.js');
var experience = require('../models/experience.js');
var router = express.Router();

router.post('/login', function(req, res, next) {
	// Login pas sécurisé du tout, mais à voir plus tard si on peut mieux faire
	req.session.studentid = req.body.studentid;
	res.redirect('/form');
});

router.get('/login', function(req, res, next) {
	if(req.session.studentid) {
		res.redirect('/form');
	} else {
		res.render('login.ejs');
	}
});

// Create a new experience with only studentid
router.get('/new', function(req, res, next) {
	if(! req.session.studentid) {
		return res.redirect('/form/login');
	}
	experience.createNewEmptyExperience(req.session.studentid, function(err, result) {
		if(err) return next(err);
		form.getFormGroupNameByOrder(0, function(err, firstgroupname) {
			if(err) return next(err);
			res.redirect('/form/' + result + '/' + firstgroupname);
		});
	});
});

router.get('/:idexp/done', function(req, res, next) {
	res.render('formdone.ejs');
});

// Show the form for given experience and formgroup
router.get('/:idexp/:formgroup', function(req, res, next) {
	if(! req.session.studentid) {
		return res.redirect('/form/login');
	}
	form.getFormGroupByName(req.params.formgroup, function(err, result) {
		if(err) return next(err);
		res.render('formgroup.ejs', {formgroup: result, formgroupname: req.params.formgroup, expid: req.params.idexp});
	});
});

// Receive and save infos for given exerience and formgroup
router.post('/:idexp/:formgroup', function(req, res, next) {
	if(! req.session.studentid) {
		return res.redirect('/form/login');
	}
	experience.checkStudentHasAccess(req.session.studentid, req.params.idexp, function(err) {
		if(err) return next(err);
		form.saveAnswers(req.body, function(err) {
			if(err) return next(err);
			form.validateFormGroup(Object.keys(req.body), req.params.formgroup, req.params.idexp, function(err, nextformgroupname) {
				if(err) return next(err);
				if(! nextformgroupname) {
					res.redirect('/form/'+req.params.idexp+'/done');
				} else {
					res.redirect('/form/'+req.params.idexp+'/'+nextformgroupname);
				}
			});
		});
	}, function(err) {
		if(err) return next(err);
		res.status(403).send('Access denied !');
		
	});
});

// Information sur l'état d'avancement du formulaire sur l'experience indiqué
router.get('/:idexp', function(req, res, next) {
	form.getFormGroupsStates(req.params.idexp, function(err, result) {
		if(err) return next(err);
		res.render('formroot.ejs', {formgroup: result, idexp: req.params.idexp});
	});
});

router.use('/', function(req, res, next) {
	if(! req.session.studentid) {
		return res.redirect('/form/login');
	}
	experience.getExperienceListWithStudentId(req.session.studentid, function(err, result) {
		if(err) return next(err);
		res.render('formexplist.ejs', {explist: result});
	});
});


module.exports = router;
