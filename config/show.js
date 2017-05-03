var Roles = require('../util/roles').Roles;
module.exports = {
	logement: {
		role: Roles.PUBLIC,
		name: "Accommodation",
		legend: {
			id: null,
			nom: "Name",
			prix: "Price", 
			localisation_lat: null,
			localisation_long: null,
			adresse: "Address",
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
			continent: "Continent",
			list_langue: {type: "list", text: "Languages", contentTable: "langue", conditions: {}, relationTable: "parler", descAttribute: "nom"},
			list_avantages: {type: "list", text: "Advantages", contentTable: "avantage_inconvenient", conditions: {avantage: 1, displayed: 1}, relationTable: "critiquer_pays", descAttribute: "contenu"},
			list_inconvenients: {type: "list", text: "Disadvantages", contentTable: "avantage_inconvenient", conditions: {avantage: 0, displayed: 1}, relationTable: "critiquer_pays", descAttribute: "contenu"}
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
			nb_etudiants: "Number of Students",
			list_avantages: {type: "list", text: "Advantages", contentTable: "avantage_inconvenient", conditions: {avantage: 1, displayed: 1}, relationTable: "critiquer_ville", descAttribute: "contenu"},
			list_inconvenients: {type: "list", text: "Disadvantages", contentTable: "avantage_inconvenient", conditions: {avantage: 0, displayed: 1}, relationTable: "critiquer_ville", descAttribute: "contenu"}
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
