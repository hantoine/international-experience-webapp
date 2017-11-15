var express = require('express');
var router = express.Router();
var experience = require('../models/experience');
var config = require('../config')

router.get('/login', function(req, res, next) {
	if(req.session.logged) {
		res.redirect('/admin');
	} else {
		res.render('admin/login.ejs', {});
	}
});

router.post('/login', function(req, res, next) {
	if(req.body.username == config.adminUsername && req.body.password == config.adminPassword) {
		req.session.adminLogged = true;
	}
	res.redirect('/admin');
});
router.get('/logout', function(req, res, next) {
	req.session.adminLogged = false;
	res.redirect('/');
});

router.get('/', function(req, res, next) {
	if(! req.session.adminLogged) {
		res.redirect('/admin/login');
		return;
	}
	experience.getListNotDone(function(err, list) {
		if(err) return next(err);
		res.render('admin/list_exp.ejs', {experiences: list});
	});
});

router.get('/experience_done/:idexp', function(req, res, next) {
	if(! req.session.adminLogged) {
		res.redirect('/admin/login');
		return;
	}
	experience.markDone(req.params.idexp, function(err) {
		if(err) return next(err);
		res.redirect('/admin');
	});
});

router.get('/loginas/:studentid', function(req, res, next) {
	if(! req.session.adminLogged) {
		res.redirect('/admin/login');
		return;
	}
	req.session.studentid = req.params.studentid;
	res.redirect('/form');
});

module.exports = router;
