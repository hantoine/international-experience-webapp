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
	},
	pays: {
		role: Roles.PUBLIC,
		name: "Country",
		legend: {
			id_pays: null,
			nom: "Name",
			continent: "Continent"
		},
		unlinkedVar: ['continent']
	},
	ville: {
		roles: Roles.PUBLIC,
		name: "City",
		legend: {
			id_ville: null,
			nom: "Name",
			nb_habitants: "Number of Inhabitants",
			nb_etudiants: "Number of Students"
		},
		unlinkedVar: []
	}
}
