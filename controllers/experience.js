var express = require('express');
var genericModel = require('../models/generic');
var router = express.Router();
var experience = require('../models/experience');

router.get('/show/:idexp', function(req, res, next) {
	res.render('show_experience.ejs', {});
});

router.get('/:continent', function(req, res, next) {
	experience.getListWithLocation(req.params.continent,null,null, null, function(err, experiences) {
		genericModel('continents').getList(null,function(err, continents) {
			res.render('experience.ejs', {
				continents: continents,
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
				experiences: experiences,	
			});
		});
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
router.get('/', function(req, res, next) {

	experience.getListWithLocation(null,null,null, null, function(err, experiences) {
		genericModel('continents').getList(null,function(err, continents) {
			res.render('experience.ejs', {
				continents: continents,
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
				experiences: experiences,
			});
		});
	});
});

module.exports = router;
