var db = require('../db.js');

exports.getExperienceListWithStudentId = function(studentid, done) {
	db.get().query('SELECT id_experience AS id, age FROM `experience` WHERE id_etudiant = ?', studentid, function(err, rows) {
		if(err) return done(err);
		done(null, rows);
	});
};

exports.createNewEmptyExperience = function(studentid, done) {
	db.get().query('INSERT INTO `experience` (`id_etudiant`) VALUES (?);', studentid, function(err, result) {
		if(err) return done(err);
		done(null, result.insertId);
	});
};

