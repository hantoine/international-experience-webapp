var express = require('express');
var router = express.Router();
var genericModel = require('../models/generic')
var rolesManager = require('../util/roles');
var objectsAuthorizations = require('../config/delete');

var models = {}
for (var objectType in objectsAuthorizations) {
	models[objectType] = genericModel.get(objectType);
	router.post('/'+objectsAuthorizations[objectType].name+'/:id', (function(objectType) { return function(req, res, next) {
		if (rolesManager.getRole(req.session) < objectsAuthorizations[objectType].role) {
			return res.status(403).end("Not authorized");
		}
		models[objectType].delete(req.params.id, function(err) {
			if(err) return next(err);
			req.session.refererUsed = true;
			res.redirect(req.session.referer.pop());
		});
	}})(objectType));
}

module.exports = router;
