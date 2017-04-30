var db = require('../db.js');

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
			query += 'o.id_organisation = ' + db.escape(universityid)
		}
		else if(cityid)
		{
			query += 'v.id_ville = ' + db.escape(cityid)
		}
		else if (countryid)
		{
			query += 'p.id_pays = ' + db.escape(countryid)
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
