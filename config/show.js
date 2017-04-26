var Roles = require('../util/roles').Roles;
module.exports = {
	logement: {
		role: Roles.PUBLIC,
		name: "Accommodation",
		legend: {
			id_logement: null,
			nom: "Name",
			prix: "Price", 
			localisation_lat: "Latitude",
			localisation_long: "Longitude",
			ville: "City",
			type_logement: "Type of accommodation"
		},
		unlinkedVar: ['type_logement']
	}
}
