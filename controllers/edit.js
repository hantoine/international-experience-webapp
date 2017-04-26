var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic')
var rolesManager = require('../util/roles');
var objectList = require('../config/edit');

var models = {}
for (var objectType in objectList) {
	models[objectType] = genericModel.get(objectType);
	router.get('/'+objectType+'/:id', (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].getById(req.params.id, true, function(err, object) {
			if(err) return next(err);
			var legend = objectList[objectType].legend;
			models[objectType].completeLegend(legend, function(err) {
				if(err) return next(err);
				res.render('generic/edit.ejs', {
					item_name: objectList[objectType].name,
					item_id: objectType,
					object: object,
					legend: legend
				});
			});
		});
	}})(objectType));
	router.post('/'+objectType+'/:id', (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].update(req.params.id, req.body, function(err){
			if(err) return console.log('Error while updating ' + objectType + ' with id ' + req.params.id + ' : ' + err); 
			res.redirect('/show/'+objectType+'/'+req.params.id);
		});
	}})(objectType));
}

module.exports = router;
