var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic')
var rolesManager = require('../util/roles');
var objectList = require('../config/show');
var objectEditInfos = require('../config/edit');
var objectDeleteInfos = require('../config/delete');

var models = {}
for (var objectType in objectList) {
	models[objectType] = genericModel.get(objectType);
	router.get('/'+objectType+'/:id', (function(ObjectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].getById(req.params.id, false, function(err, object) {
			if(err) return next(err);
			for (var i=0; i < objectList[objectType].unlinkedVar.length; i++) {
				object[objectList[objectType].unlinkedVar[i]] = (object[objectList[objectType].unlinkedVar[i]]) ? object[objectList[objectType].unlinkedVar[i]].nom : null;
			}
			res.render('generic/show.ejs', {
				item_name: objectList[objectType].name,
				item_id: objectType,
				object: object,
				legend: objectList[objectType].legend,
				allowEdit: (rolesManager.getRole(req.session) >= objectEditInfos[objectType].role), 
				allowDelete: (rolesManager.getRole(req.session) >= objectEditInfos[objectType]) 
			});
		});
	}})(objectType));
}

module.exports = router;
