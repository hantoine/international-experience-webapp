var express = require('express');
var router = express.Router();

router.get('/back', function(req, res, next) {
	if(typeof req.session.referer == 'undefined') {
		return res.redirect('/');
	}
	var referer = req.session.referer.pop();
	req.session.refererUsed = true;
	res.redirect((referer) ? referer : '/');
});

router.get('/emptyreferer', function(req, res, next) {
	req.session.referer = [];
	res.redirect('/');
});

router.get('/printreferer', function(req, res, next) {
	res.send(req.session.referer);
});

module.exports = router;
