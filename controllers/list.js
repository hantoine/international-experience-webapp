var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic');
var experience = require('../models/experience');
var organisation = require('../models/organisation');
var objectList = require('../config/list');
var objectNewInfo = require('../config/new');
var objectShowInfo = require('../config/show');
var rolesManager = require('../util/roles');

var models = {}
for (var objectType in objectList) {
	models[objectType] = genericModel.get(objectType);
	router.get('/'+objectList[objectType].name, (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		var attributes = ['nom'];
		if(objectType=='organisation') {
			attributes.push('estEcole');
		}
		models[objectType].getList(attributes, req.query, null, null, null, null, function(err, objects) {
			if(err) return next(err);
			var allowNew = (rolesManager.getRole(req.session) >= objectNewInfo[objectType])
			var allowShow = (objectShowInfo[objectType]) ? (rolesManager.getRole(req.session) >= objectShowInfo[objectType].role) : false;
			res.render('generic/list.ejs', {objects: objects, item_name: objectList[objectType].name, item_id: objectList[objectType].name, legend: objectList[objectType].legend, allowNew: allowNew, allowShow: allowShow});
		});
	}})(objectType));
}

models['organisation'] = genericModel.get('organisation');
models['experience'] = genericModel.get('experience');
router.get('/experience/:continent?/:country?/:city?/:university?', function(req, res, next) {
	experience.getListWithLocation(req.params.continent,req.params.country,req.params.city, req.params.university, function(err, experiences) {
		var continent = (req.params.continent != "Continent") ? req.params.continent : null;
		var country = (req.params.country != "Country") ? req.params.country : null;
		var city = (req.params.city != "City") ? req.params.city : null;
		var university = (req.params.university != "University") ? req.params.university : null;
		if(err) return next(err);
		models['experience'].getList(['continent.nom'], {}, [{table: "organisation", extTables: [{table: 'ville', extTables: [{table: 'pays', extTables: [{table: 'continent'}]}]}]}], "continent.id_continent", null, null, function(err, continents) {
			if(err) return next(err);
			models['experience'].getList(['pays.nom'], {'continent.nom': continent}, [{table: "organisation", extTables: [{table: 'ville', extTables: [{table: 'pays', extTables: [{table: 'continent'}]}]}]}], "pays.id_pays", null, null, function(err, countries) {
				if(err) return next(err);
				models['experience'].getList(['ville.nom'], {'pays.nom': country, 'continent.nom': continent}, [{table: "organisation", extTables: [{table: 'ville', extTables: [{table: 'pays', extTables: [{table: 'continent'}]}]}]}], "ville.id_ville", null, null, function(err, cities) {
					if(err) return next(err);
					models['experience'].getList(['organisation.nom'], {'ville.nom': city, 'pays.nom': country, 'continent.nom': continent}, [{table: "organisation", extTables: [{table: 'ville', extTables: [{table: 'pays', extTables: [{table: 'continent'}]}]}]}], "organisation.id_organisation", null, null, function(err, universities) {
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

router.get('/organisation/:continent?/:country?/:city?/:typ?', function(req, res, next) {
	organisation.getListWithLocation(req.params.continent,req.params.country,req.params.city, req.params.typ, function(err, organizations) {
		if(err) return next(err);
		models['continent'].getList(['nom'], null, null, null, null, null, function(err, continents) {
			if(err) return next(err);
			genericModel.get('experience_view').getList(['country', 'country id'], (req.params.continent) ? {'continent': req.params.continent, 'country id': {operator: 'is not null'}} : {'country id': {operator: 'is not null'}}, null, "country", null, null, function(err, countries) {
				if(err) return next(err);
				models['ville'].getList(['nom'], (req.params.country) ? {'pays.nom': req.params.country} : ((req.params.continent) ? {'continent.nom': req.params.continent} : null), [{table: 'pays', extTables: [{table: 'continent'}]}], null, null, null, function(err, cities) {
					if(err) return next(err);
						res.render('list_organisation.ejs', {
							continents: continents,
							continent: req.params.continent,
							countries: countries,
							country: req.params.country,
							cities: cities,
							city: req.params.city,
							organizations: organizations,
							typ: req.params.typ
					});
				});
			});
		});
	});
});


router.get('/experience_advanced/', function(req, res, next) {
	if(typeof req.session.referer == 'undefined') {
		req.session.referer = [];
	}
	if(! req.session.refererUsed) {
		req.session.referer.push(req.headers.referer);
	}
	req.session.refererUsed = false;
	genericModel.get('experience_view').getColumns(function(err, cols) {
		//TODO remove id_experience_view
		cols.find(function(element, index) {
			if(element == "id_experience_view")
				cols[index] = "id_experience";
		});
		res.render('list_generic.ejs', {table: 'experience', cols: cols, defaultCols: ["country", "country id", "city", "city id", "organization", "organization id","duration"]});
	});
});

module.exports = router;
