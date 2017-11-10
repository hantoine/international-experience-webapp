var db = require('../db.js');

exports.getListWithLocation = function(continentid,countryid,cityid, type, done) {
	query = 'SELECT o.id_organisation AS id, o.nom AS name, v.nom AS ville, p.nom AS pays, c.nom AS continent, o.estEcole FROM organisation o\
		JOIN ville v ON o.id_ville = v.id_ville\
		JOIN pays p ON v.id_pays = p.id_pays\
		JOIN continent c ON p.id_continent = c.id_continent';
	if ((cityid && cityid != 'City') || (countryid && countryid != 'Country') || (continentid && continentid != 'Continent') || (type && ['School', 'Company'].includes(type))){
		query += ' WHERE ';
		var locationCondition = false;
		if(cityid && cityid != 'City')
		{
			query += 'v.nom = ' + db.escape(cityid)
			locationCondition = true;
		}
		else if (countryid && countryid != 'Country')
		{
			query += 'p.nom = ' + db.escape(countryid)
			locationCondition = true;
		}
		else if (continentid && continentid != 'Continent')
		{
			query += 'c.nom = ' + db.escape(continentid)
			locationCondition = true;
		}

		if(type && ['School', 'Company'].includes(type)) {
			if(locationCondition) {
				query += ' AND ';
			}
			query += 'o.estEcole = ' + ((type == 'School') ? 1 : 0);
		}
	}
	db.get().query(query, function(err,rows) {
		if(err) return done(err);
		done(null, rows);
	});
}
