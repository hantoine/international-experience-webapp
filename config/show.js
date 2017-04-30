var Roles = require('../util/roles').Roles;
module.exports = {
	logement: {
		role: Roles.PUBLIC,
		name: "Accommodation",
		legend: {
			id: null,
			nom: "Name",
			prix: "Price", 
			localisation_lat: "Latitude",
			localisation_long: "Longitude",
			ville: "City",
			type_logement: "Type of accommodation",
			list_avantages: {type: "list", text: "Advantages", contentTable: "avantage_inconvenient", conditions: {avantage: 1, displayed: 1}, relationTable: "critiquer_logement", descAttribute: "contenu"},
			list_inconvenients: {type: "list", text: "Disadvantages", contentTable: "avantage_inconvenient", conditions: {avantage: 0, displayed: 1}, relationTable: "critiquer_logement", descAttribute: "contenu"}
		},
		unlinkedVar: ['type_logement']
	},
	pays: {
		role: Roles.PUBLIC,
		name: "Country",
		legend: {
			id: null,
			nom: "Name",
			continent: "Continent"
		},
		unlinkedVar: ['continent']
	},
	ville: {
		roles: Roles.PUBLIC,
		name: "City",
		legend: {
			id: null,
			nom: "Name",
			nb_habitants: "Number of Inhabitants",
			nb_etudiants: "Number of Students"
		},
		unlinkedVar: []
	},
	avantage_inconvenient: {
		roles: Roles.ADMIN,
		name: "Advantage/Disadvantage",
		legend: {
			id: null,
			contenu: "Text",
			avantage: "Is advantage ?",
			displayed: "Is displayed ?"
		}
	}
}
