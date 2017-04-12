var db = require('../db.js')

exports.getFormGroupList = function(done) {
	db.get().query('SELECT id_groupe_questions, nom FROM `groupe_questions` ORDER BY `ordre`', function(err, rows) {
		if (err) return done(err)
		done(null, rows)
	})
}
