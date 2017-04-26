var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic')
var rolesManager = require('../util/roles');
var objectsAuthorizations = require('../config/new');

var models = {}
for (var objectType in objectsAuthorizations) {
	models[objectType] = genericModel.get(objectType);
	router.post('/'+objectType, (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectsAuthorizations[objectType]) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].createNew(req.query, function(err, id) {
			if(err) return next(err);
			res.redirect('/edit/' + objectType + '/' + id);
		});
	}})(objectType));
}

module.exports = router;
