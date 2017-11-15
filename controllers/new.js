var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic')
var rolesManager = require('../util/roles');
var objectList = require('../config/edit');
var objectAuthorizations = require('../config/new');

var models = {}
for (var objectType in objectList) {
	models[objectType] = genericModel.get(objectType);
	var routeHandler = function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectAuthorizations[objectType]) {
			return res.status(403).end("Not authorized");
		}
		var legend = objectList[objectType].legend;
		models[objectType].completeLegend(legend, function(err) {
			if(err) return next(err);
			for (var key in legend) {
				if(legend[key].type == genericModel.QuestionType.EXT) {
					legend[key].roleNew = (typeof objectAuthorizations[key] != 'undefined') ? objectAuthorizations[key] : 10;
				}
			}
			res.render('generic/new.ejs', {
				item_name: objectList[objectType].name,
				item_id: objectType,
				legend: legend,
				role: rolesManager.getRole(req.session)
			});
		});
	}};
	router.get('/'+objectList[objectType].name, routeHandler(objectType));
	router.get('/'+objectType, routeHandler(objectType));


	router.post('/'+objectList[objectType].name, (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectAuthorizations[objectType]) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].createNew(req.body, function(err, id){
			if(err) return next(err);
			res.cookie('lastCreated_'+objectType, id+' ' + req.body.nom, {maxAge: 2000});
			res.redirect('/show/'+objectList[objectType].name+'/'+id);
		});
	}})(objectType));
}

module.exports = router;
