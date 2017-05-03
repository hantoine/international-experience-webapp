var db = require('../db.js');

exports.getListWithLocation = function(continentid,countryid,cityid, done) {
	query = 'SELECT o.id_organisation AS id, o.nom AS name, v.nom AS ville, p.nom AS pays, c.nom AS continent, o.estEcole FROM organisation o\
		JOIN ville v ON o.id_ville = v.id_ville\
		JOIN pays p ON v.id_pays = p.id_pays\
		JOIN continent c ON p.id_continent = c.id_continent';

	if (continentid || countryid || cityid){
		query += ' WHERE ';

		if(cityid)
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
