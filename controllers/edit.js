var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic')
var rolesManager = require('../util/roles');
var objectList = require('../config/edit');
var objectNewAuth = require('../config/new');

var models = {}
for (var objectType in objectList) {
	models[objectType] = genericModel.get(objectType);
	router.get('/'+objectList[objectType].name+'/:id', (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].getById(req.params.id, true, objectList[objectType].legend , function(err, object) {
			if(err) return next(err);
			var legend = objectList[objectType].legend;
			models[objectType].completeLegend(legend, function(err) {
				if(err) return next(err);
				if(typeof req.session.referer == 'undefined') {
					req.session.referer = [];
				}
				if(! req.session.refererUsed) {
					req.session.referer.push(req.headers.referer);
				}
				req.session.refererUsed = false
				for (var key in legend) {
					if(legend[key].type == genericModel.QuestionType.EXT) {
						legend[key].roleNew = (typeof objectNewAuth[key] != 'undefined') ? objectNewAuth[key] : 10;
					}
				}
				res.render('generic/edit.ejs', {
					item_name: objectList[objectType].name,
					item_id: objectType,
					object: object,
					legend: legend,
					role: rolesManager.getRole(req.session)
				});
			});
		});
	}})(objectType));
	router.post('/'+objectList[objectType].name+'/:id', (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].update(req.params.id, req.body, function(err){
			if(err) return console.log('Error while updating ' + objectType + ' with id ' + req.params.id + ' : ' + err);
			req.session.refererUsed = true;
			res.redirect(req.session.referer.pop());
		});
	}})(objectType));
}

module.exports = router;
