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

exports.checkStudentHasAccess = function(studentid, expid, hasAccessFct, hasNotAccessFct) {
	db.get().query('SELECT id_experience FROM experience WHERE id_experience = ? AND id_etudiant = ?', [expid, studentid], function(err, result) {
		if (err) return hasNotAccessFct(err);
		if(result.length) {
			hasAccessFct();
		} else {
			hasNotAccessFct();
		}
	});
};


exports.getListWithLocation = function(continentsid,contryid,cityid, universityid, done) {
	query = 'SELECT e.id_experience, o.nom, v.nom, p.nom, c.nom, e.age, e.duree FROM experience e

		JOIN organisation o ON e.id_organisation = o.id_organisation
		JOIN ville v ON o.id_ville = v.id_ville
		JOIN pays p ON v.id_pays = p.id_pays
		JOIN continent c ON p.id_continent = c.id_continent';

	if (continentid || contryid || cityid || universityid){
		query += ' WHERE ';

		if (universityid)
		{
			query += 'o.id_organisation = ' + db.escape(universityid)
		}
		else if(cityid)
		{
			query += 'v.id_ville = ' + db.escape(cityid)
		}
		else if (contryid)
		{
			query += 'p.id_pays = ' + db.escape(contryid)
		}
		else if (continentid)
		{
			query += 'c.id_continent = ' + db.escape(continentid)
		}
	}
	console.log(query);
	db.get().query(query, function(err,rows) {
		if(err) return done(err);
		done(null, rows);
	});
}

