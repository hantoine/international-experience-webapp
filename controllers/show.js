var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic')
var experience = require('../models/experience');
var rolesManager = require('../util/roles');
var objectList = require('../config/show');
var objectEditInfos = require('../config/edit');
var objectDeleteInfos = require('../config/delete');

var models = {}
for (var objectType in objectList) {
	models[objectType] = genericModel.get(objectType);
	router.get('/'+objectType+'/:id', (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].getById(req.params.id, false, objectList[objectType].legend, function(err, object) {
			if(err) return next(err);
			if(objectList[objectType].unlinkedVar) {
				for (var i=0; i < objectList[objectType].unlinkedVar.length; i++) {
					object[objectList[objectType].unlinkedVar[i]] = (object[objectList[objectType].unlinkedVar[i]]) ? object[objectList[objectType].unlinkedVar[i]].nom : null;
				}
			}
			var role = rolesManager.getRole(req.session);
			for(var key in objectList[objectType].legend) {
				var value = objectList[objectType].legend[key]
				if(value && (typeof value == 'object') && value.type == 'list') {
					value.canEdit = (objectEditInfos[value.contentTable]) ? (role >= objectEditInfos[value.contentTable].role) : false; 
				}
			}
			for (var key in object) {
				if(typeof objectList[objectType].legend[key] == 'undefined') {
					return next('Error : No legend for entry ' + key + ' in ' + objectType + '.');
				}
			}
			if(typeof req.session.referer == 'undefined') {
				req.session.referer = [];
			}
			if(! req.session.refererUsed) {
				req.session.referer.push(req.headers.referer);
			}
			req.session.refererUsed = false;
			res.render('generic/show.ejs', {
				item_name: objectList[objectType].name,
				item_id: objectType,
				object: object,
				legend: objectList[objectType].legend,
				allowEdit: (role >= objectEditInfos[objectType].role), 
				allowDelete: (role >= objectDeleteInfos[objectType]),
			});
		});
	}})(objectType));
}

router.get('/experience/:id', function(req, res, next) {
	experience.getById(req.params.id, function(err, exp) {
		if(err) return next(err);
		if (rolesManager.getRole(req.session) >= rolesManager.Roles.ADMIN) {
			res.render('show_experience.ejs', {exp: exp});
		} else {
			exp.nom = null;
			exp.prenom = null;	
			res.render('show_experience.ejs', {exp: exp});
		}

	});
});
module.exports = router;
