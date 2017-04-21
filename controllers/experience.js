var express = require('express');
var router = express.Router();

router.get('/show/:idexp', function(req, res, next) {
	res.render('show_experience.ejs', {});
});

router.get('/:country', function(req, res, next) {
	res.render('experience.ejs', {
		experiences: [
			{id_etudiant: 48, country: 'Canada'},
			{id_etudiant: 47, country: 'US'}
		], 
	});
});


router.get('/:country/:city', function(req, res, next) {
	res.render('experience.ejs', {
		experiences: [
			{id_etudiant: 48, city: 'ex1'},
			
		], 
	});
});


router.get('/:country/:city/:univerty', function(req, res, next) {
	res.render('experience.ejs', {
		experiences: [
			{id_etudiant: 48, univertity: 'Universtité1'},
		], 
	});
});


module.exports = router;
