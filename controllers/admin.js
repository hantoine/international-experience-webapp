var express = require('express');
var router = express.Router();

router.get('/login', function(req, res, next) {
	if(req.session.logged) {
		res.redirect('/admin');
	} else {
		res.render('admin/login.ejs', {});
	}
});

router.post('/login', function(req, res, next) {
	if(req.body.password == "troisdeuxun") {
		req.session.logged = true;
		res.redirect('/admin');
	}
});
router.get('/logout', function(req, res, next) {
	req.session.logged = false;
	res.redirect('/');
});

router.get('/', function(req, res, next) {
	if(! req.session.logged) {
		res.redirect('/admin/login');
		return;
	}
	res.send('Not implemented yet');
});

module.exports = router;
