var db = require('../db.js')

module.exports = function(table) {
	var model = {}
	model.getList = function(conditions, done) {
		query = 'SELECT ' + db.get().escape('id_'+ table) + ' AS id, nom FROM ' + table;
		if(conditions && conditions.length > 0) {
			query += ' WHERE ';
			for (var i = 0; i < conditions.length; i++) {
				db.get().escape(condition[i].attribute) + ' = ' + db.get().escape(conditions[i].value);
				if(i != conditions.length - 1) {
					query += ' AND ';
				}
			}
		}
		console.log(query);
		db.get().query(query, function(err,rows) {
			if(err) return done(err);
			done(null, rows);
		});
	}
	return model;
}

