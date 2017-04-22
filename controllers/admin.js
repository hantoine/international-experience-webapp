var express = require('express');
var router = express.Router();

});


router.get('/login', function(req, res, next) {
	if(req.session.logged) {
		res.redirect('/admin');
	} else {
		res.render('admin/login.ejs', {});
	}
});

module.exports = router;
