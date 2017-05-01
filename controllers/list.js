var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic');
var experience = require('../models/experience');
var objectList = require('../config/list');
var objectNewInfo = require('../config/new');
var objectShowInfo = require('../config/show');
var rolesManager = require('../util/roles');

var models = {}
for (var objectType in objectList) {
	models[objectType] = genericModel.get(objectType);
	router.get('/'+objectType, (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].getList(['nom'], req.query, null, function(err, objects) {
			if(err) return next(err);
			var allowNew = (rolesManager.getRole(req.session) >= objectNewInfo[objectType])
			var allowShow = (objectShowInfo[objectType]) ? (rolesManager.getRole(req.session) >= objectShowInfo[objectType].role) : false;
			res.render('generic/list.ejs', {objects: objects, item_name: objectList[objectType].name, item_id: objectType, legend: objectList[objectType].legend, allowNew: allowNew, allowShow: allowShow});
		});
	}})(objectType));
}

router.get('/experience/:continent?/:country?/:city?/:university?', function(req, res, next) {
	experience.getListWithLocation(req.params.continent,req.params.country,req.params.city, req.params.university, function(err, experiences) {
		models['continent'].getList(['nom'], null, null, function(err, continents) {
			if(err) return next(err);
			models['pays'].getList(['nom'], (req.params.continent) ? {'continent.nom': req.params.continent} : null, (req.params.continent) ? [{table: 'continent'}] : null, function(err, countries) {
				if(err) return next(err);
				models['ville'].getList(['nom'], (req.params.country) ? {'pays.nom': req.params.country} : ((req.params.continent) ? {'continent.nom': req.params.continent} : null), [{table: 'pays', extTables: [{table: 'continent'}]}], function(err, cities) {
					if(err) return next(err);
					models['organisation'].getList(['nom'], (req.params.city) ? {'ville.nom': req.params.city} : ((req.params.country) ? {'pays.nom': req.params.country} : ((req.params.continent) ? {'continent.nom': req.params.continent} : null)), [{table: 'ville', extTables: [{table: 'pays', extTables: [{table: 'continent'}]}]}], function(err, universities) {
						if(err) return next(err);
						res.render('list_experience.ejs', {
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
