var express = require('express');
var form = require('../models/form.js');
var experience = require('../models/experience.js');
var router = express.Router();
var roleManager = require('../util/roles.js');

router.post('/login', function(req, res, next) {
	// Login pas sécurisé du tout, mais à voir plus tard si on peut mieux faire
	req.session.studentid = req.body.studentid;
	res.redirect('/form');
});

router.get('/login', function(req, res, next) {
	if(req.session.studentid) {
		res.redirect('/form');
	} else {
		res.render('form/login.ejs');
	}
});
router.get('/logout', function(req, res, next) {
	req.session.studentid = null;
	res.redirect('/');
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
	res.render('form/done.ejs');
});

// Show the form for given experience and formgroup
router.get('/:idexp/:formgroup', function(req, res, next) {
	if(! req.session.studentid) {
		return res.redirect('/form/login');
	}
	form.getFormGroupsStates(req.params.idexp, function(err, formgroupslist) {
		if(err) return next(err);
		for(var i = 0 ; i < formgroupslist.length; i++) {
			if(formgroupslist[i].nom == req.params.formgroup) {
				return form.getFormGroupByName(req.params.formgroup, function(err, result) {
					if(err) return next(err);
					(function(callback) {
						if( ! formgroupslist[i].done) {
							// directement renvoyer le formulaire vide
							callback();
						} else {
							// obtenir les réponses puis renvoyer le formulaire complété
							form.addAnswers(req.params.idexp, result, callback);
						}
					})(function(err) {
						if (err) return next(err);
						res.render('form/questions_group.ejs', {formgroup: result, formgroupname: req.params.formgroup, expid: req.params.idexp, role: roleManager.getRole(req.session)});
					});
				});
			}
		}
		//if formgroup not found, try other routes then 404
		next();
	});
});

// Receive and save infos for given exerience and formgroup
router.post('/:idexp/:formgroup', function(req, res, next) {
	if(! req.session.studentid) {
		return res.redirect('/form/login');
	}
	experience.checkStudentHasAccess(req.session.studentid, req.params.idexp, function(err) {
		if(err) return next(err);
		form.saveAnswers(req.params.idexp, req.body, function(err) {
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
		console.log(result);
		res.render('form/experience_progress.ejs', {formgroup: result, idexp: req.params.idexp});
	});
});

router.get('/', function(req, res, next) {
	if(! req.session.studentid) {
		return res.redirect('/form/login');
	}
	experience.getExperienceListWithStudentId(req.session.studentid, function(err, result) {
		if(err) return next(err);
		console.log(result);
		res.render('form/experience_list.ejs', {explist: result});
	});
});


module.exports = router;
