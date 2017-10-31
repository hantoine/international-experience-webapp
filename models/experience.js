var db = require('../db.js');
var etudiant = require('./generic').get('etudiant');

exports.getById = function(expid, done) {
	db.get().query("SELECT * FROM experience_view WHERE id = ?", expid, function(err, row) {
		if(err) return done(err);
		if(row.length < 1) return done("Error : No Experience by that ID");
		done(null, row[0]);
	});
}
exports.getExperienceListWithStudentId = function(studentid, done) {
	query = 'SELECT \
		e.id_experience AS id, \
		COALESCE(CONCAT(\'Experience at \',o.nom, \' (\',v.nom,\')\'), CONCAT(\'Experience at the age of \', e.age), CONCAT(\'Experience \', e.id_experience)) AS name \
		FROM experience e \
		LEFT JOIN organisation o ON e.id_organisation = o.id_organisation \
		LEFT JOIN ville v ON o.id_ville = v.id_ville\
		WHERE e.id_etudiant = ?'
	db.get().query(query, studentid, function(err, rows) {
		if(err) return done(err);
		done(null, rows);
	});
};

exports.createNewEmptyExperience = function(studentid, done) {
	db.get().query('INSERT INTO `experience` (`id_etudiant`) VALUES (?);', studentid, function(err, result) {
		if(err) return done(err);
		etudiant.createNew({id_etudiant: studentid}, function(err) {
			if(err && err.code != 'ER_DUP_ENTRY') return done(err); //There is no error is the student already exists
			done(null, result.insertId);
		});

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


exports.getListWithLocation = function(continentid,countryid,cityid, universityid, done) {
	query = 'SELECT e.id_experience AS id, o.nom AS organisation, v.nom AS ville, p.nom AS pays, c.nom AS continent, e.duree AS duree, DATE_FORMAT(e.date, \'%e %b %Y\') AS date FROM experience e\
\
		JOIN organisation o ON e.id_organisation = o.id_organisation\
		JOIN ville v ON o.id_ville = v.id_ville\
		JOIN pays p ON v.id_pays = p.id_pays\
		JOIN continent c ON p.id_continent = c.id_continent';

	if (continentid || countryid || cityid || universityid){
		query += ' WHERE ';

		if (universityid)
		{
			query += 'o.nom = ' + db.escape(universityid)
		}
		else if(cityid)
		{
			query += 'v.nom = ' + db.escape(cityid)
		}
		else if (countryid)
		{
			query += 'p.nom = ' + db.escape(countryid)
		}
		else if (continentid)
		{
			query += 'c.nom = ' + db.escape(continentid)
		}
	}
	db.get().query(query, function(err,rows) {
		if(err) return done(err);
		done(null, rows);
	});
}

exports.getListNotDone = function(done) {
	var query = "SELECT e.id_experience AS id, o.nom AS organisation, v.nom AS ville, p.nom AS pays, c.nom AS continent, e.duree AS duree, DATE_FORMAT(e.date, \'%e %b %Y\') AS date, CONCAT(t.prenom, ' ', t.nom) AS etudiant FROM experience e\
		LEFT JOIN organisation o ON e.id_organisation = o.id_organisation\
		LEFT JOIN ville v ON o.id_ville = v.id_ville\
		LEFT JOIN pays p ON v.id_pays = p.id_pays\
		LEFT JOIN continent c ON p.id_continent = c.id_continent\
		LEFT JOIN etudiant t ON e.id_etudiant = t.id_etudiant WHERE e.done = '0'";
	db.get().query(query, function(err, rows) {
		if(err) return done(err);
		done(null, rows);
	});
};

exports.markDone = function(idexp, done) {
	db.get().query("UPDATE experience SET `done` = '1' WHERE `id_experience` = ?", idexp, function(err) {
		if(err) return done(err);
		done()
	});
}
