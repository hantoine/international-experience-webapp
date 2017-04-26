var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic');
var objectList = require('../config/list');
var objectNewInfo = require('../config/new');
var rolesManager = require('../util/roles');

var models = {}
for (var objectType in objectList) {
	models[objectType] = genericModel.get(objectType);
	router.get('/'+objectType, (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectList[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].getList(null, function(err, objects) {
			if(err) return next(err);
			var allowNew = (rolesManager.getRole(req.session) >= objectNewInfo[objectType])
			res.render('generic/list.ejs', {objects: objects, item_name: objectList[objectType].name, item_id: objectType, legend: objectList[objectType].legend, allowNew: allowNew});
		});
	}})(objectType));
}

module.exports = router;
