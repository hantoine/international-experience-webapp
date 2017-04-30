var express = require('express');
var genericModel = require('../models/generic');
var router = express.Router();
var experience = require('../models/experience');

router.get('/show/:idexp', function(req, res, next) {
	res.render('show_experience.ejs', {});
});

router.get('/:continent?/:country?/:city?/:university?', function(req, res, next) {
	experience.getListWithLocation(req.params.continent,req.params.country,req.params.city, req.params.university, function(err, experiences) {
		genericModel.get('continent').getList(['nom'], null, null, function(err, continents) {
			if(err) return next(err);
			genericModel.get('pays').getList(['nom'], (req.params.continent) ? {'continent.nom': req.params.continent} : null, (req.params.continent) ? [{table: 'continent'}] : null, function(err, countries) {
				if(err) return next(err);
				genericModel.get('ville').getList(['nom'], (req.params.country) ? {'pays.nom': req.params.country} : ((req.params.continent) ? {'continent.nom': req.params.continent} : null), [{table: 'pays', extTables: [{table: 'continent'}]}], function(err, cities) {
					if(err) return next(err);
					genericModel.get('organisation').getList(['nom'], (req.params.city) ? {'ville.nom': req.params.city} : ((req.params.country) ? {'pays.nom': req.params.country} : ((req.params.continent) ? {'continent.nom': req.params.continent} : null)), [{table: 'ville', extTables: [{table: 'pays', extTables: [{table: 'continent'}]}]}], function(err, universities) {
						if(err) return next(err);
						res.render('experience.ejs', {
							continents: continents,
							continent: req.params.continent,
							countries: countries,
							country: req.params.country,
							cities: cities,
							city: req.params.city,
							universities: universities,
							university: req.params.university,
							experiences: experiences
						});
					});
				});
			});
		});
	});
	
});

module.exports = router;
