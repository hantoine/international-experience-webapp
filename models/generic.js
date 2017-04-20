var table = "pays"

module.exports = function(table) {
	var model = {}
	model.getList(conditions, done) {
		query = 'SELECT ' + db.get().escape('id_'+ table) + ', nom FROM ' + db.get().escape(table);
		if(conditions && conditions.length > 0) {
			query += ' WHERE ';
			for (var i = 0; i < conditions.length; i++) {
				db.get().escape(condition[i].attribute) + ' = ' + db.get().escape(conditions[i].value);
				if(i != conditions.length - 1) {
					query += ' AND ';
				}
			}
		}
		db.get().query(query, function(err,rows) {
			if(err) return done(err);
			done(null, rows);
		});

