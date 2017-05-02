var Roles = require('../util/roles').Roles;
var QuestionType = require('../models/generic.js').QuestionType;
module.exports = {
	logement: {
		role: Roles.STUDENT,
		name: "Accommodation",
		legend: {
			nom: { text: "Name", type: QuestionType.TEXT },
			prix: { text: "Price", type: QuestionType.INT },
			localisation_lat: {text: "Latitude", type: QuestionType.INT},
			localisation_long: {text: "Longitude", type: QuestionType.INT},
			ville: {text: "City", type: QuestionType.EXT},
			type_logement: {text: "Type of accommodation", type: QuestionType.EXT}
		}
	},
	ville: {
		role: Roles.STUDENT,
		name: "City",
		legend: {
			nom: {text: "Name", type: QuestionType.TEXT },
			nb_habitants: {text: "Inhabitants Number", type: QuestionType.INT },
			nb_etudiants: {text: "Students Number", type: QuestionType.INT },
			pays: {text: "Country", type: QuestionType.EXT },
		}
	},
	pays: {
		role: Roles.STUDENT,
		name: "Country",
		legend: {
			nom: {text: "Name", type: QuestionType.TEXT },
			continent: {text: "Continent", type: QuestionType.EXT }		
		}
	},
	avantage_inconvenient: {
		role: Roles.ADMIN,
		name: "Advantage/Disadvantage",
		legend: {
			contenu: {text: "Text", type: QuestionType.TEXTAREA },	
			avantage: {text: "Is it an advantage ?", type: QuestionType.BOOL },
			displayed: {text: "Should it be displayed ?", type: QuestionType.BOOL}
		}
	},
	organisation: {
		role: Roles.STUDENT,
		name: "Organisation",
		legend: {
			nom: {text:"Name", type: QuestionType.TEXT},
			nombre_etudiants: {text: "Student Number", type: QuestionType.INT},
			site_web: {text: "Website", type: QuestionType.TEXT},
			prix: {text: "Price", type: QuestionType.INT},
			commentaire: {text:"Comment", type: QuestionType.TEXTAREA},
			disponible: {text: "Available", type: QuestionType.BOOL},
			langue: {text: "Language", type: QuestionType.EXT},
			ville: {text: "City", type: QuestionType.EXT},
			estEcole: {text: "Is a school ?", type: QuestionType.BOOL}
		}
	}
}
