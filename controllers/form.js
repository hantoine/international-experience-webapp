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
	if(req.session.studentid) {
		experience.createNewEmptyExperience(req.session.studentid, function(err, result) {
			if(err) return next(err);
			res.redirect('/form/' + result);
		});
	} else {
		res.redirect('/form/login');
	}
});

// Show the form for given experience and formgroup
router.get('/:idexp/:formgroup', function(res, res, next) {
	res.status(501).send('Not implemented yet');
});

// Receive and save infos for given exerience and formgroup
router.post('/:idexp/:formgroup', function(res, res, next) {
	res.status(501).send('Not implemented yet');
});

// Information sur l'état d'avancement du formulaire sur l'experience indiqué
router.get('/:idexp', function(req, res, next) {
	form.getFormGroupsStates(req.params.idexp, function(err, result) {
		if(err) return next(err);
		res.render('formroot.ejs', {formgroup: result, idexp: req.params.idexp});
	});
});

router.use('/', function(req, res, next) {
	if(req.session.studentid) {
		experience.getExperienceListWithStudentId(req.session.studentid, function(err, result) {
			if(err) return next(err);
			res.render('formexplist.ejs', {explist: result});
		});
	} else {
		res.redirect('/form/login');
	}
});


module.exports = router;
