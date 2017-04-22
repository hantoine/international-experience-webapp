var express = require('express');
var router = express.Router();

router.get('/show/:idexp', function(req, res, next) {
	res.render('show_experience.ejs', {});
});

router.get('/:continent', function(req, res, next) {
	res.render('experience.ejs', {
		continents: [
			{id: 0, nom: "Europe"}
		],
		continent: req.params.continent,

		countries: [
			{id: 0, nom: "France"}
		],
		country: null,

		cities: [
			{id: 0, nom: "Paris"}
		],
		city: null,

		universities: [],
		university: null,
		experiences: [
			{id_etudiant: 48, city: 'ex1'},	
		]
	});
});

router.get('/:continent/:country', function(req, res, next) {
	res.render('experience.ejs', {
		continents: [
			{id: 0, nom: "Europe"}
		],
		continent: req.params.continent,

		countries: [
			{id: 0, nom: "France"}
		],
		country: req.params.country,
		
		experiences: [
			{id_etudiant: 48, city: 'ex1'},	
		]
	});
});


router.get('/:continent/:country/:city', function(req, res, next) {
	res.render('experience.ejs', {
		continents: [
			{id: 0, nom: "Europe"}
		],
		continent: req.params.continent,

		Country: [
			{id: 0, nom: "France"}
		],
		country: req.params.country,

		City: [
			{id: 0, nom: "Paris"}
		],
		city: req.params.city,

		experiences: [
			{id_etudiant: 48, city: 'ex1'},	
		]
	});
});


router.get('/:continent/:country/:city/:university', function(req, res, next) {
	res.render('experience.ejs', {
		continents: [
			{id: 0, nom: "Europe"}
		],
		continent: req.params.continent,

		Country: [
			{id: 0, nom: "France"}
		],
		country: req.params.country,

		City: [
			{id: 0, nom: "Paris"}
		],
		city: req.params.city,

		university: [
			{id: 0, nom: "Paris"}
		],
		university: req.params.university,

		experiences: [
			{id_etudiant: 48, city: 'ex1'},
		], 
	});
});


module.exports = router;
