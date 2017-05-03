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
	transport: {
		role: Roles.PUBLIC,
		name: "Transport",
		legend: {
			id: null,
			nom: "Name"
		}
	},

	certification: {
		role: Roles.PUBLIC,
		name: "Certification",
		legend: {
			id: null,
			nom: "Name",
			siteweb: "Website",
			description: "Description"
		}
	},

	domaine_etude: {
		role: Roles.PUBLIC,
		name: "Field of study",
		legend: {
			id: null,
			nom: "Name"
		}
	},

	etudiant: {
		role: Roles.PUBLIC,
		name: "Student",
		legend: {
			id: null,
			prenom: "Surname",
			nom: "First name"
		}
	},

	langue: {
		role: Roles.PUBLIC,
		name: "Languages",
		legend: {
			id: null,
			nom: "Name"
		}
	},

	ville: {
		roles: Roles.PUBLIC,
		name: "City",
		legend: {
			id: null,
			nom: "Name",
			pays: "Country",
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
	},

	organisation: {
		roles: Roles.PUBLIC,
		name: "Organisation",
		legend: {
			id: null,
			nom: "Name",
			nombre_etudiant: "Student Number",
			site_web: "Website",
			prix: "Price",
			commentaire: "Comment",
			disponible: "Available",
		}
	},

	experience: {
		roles: Roles.PUBLIC,
		name: "Experience",
		legend: {
			id: null,
			age: "Age",
			duree: "Duration",
			competences_acquises: "Skills Acquired",
			choses_faites: "Things Done",
			cout: "Price",
			cout_location: "Location's Price",
			cout_alimentation: "Food's Price",
			cout_formation: "Formation's Price",
			cout_recherche_agence: "Research's Price",
			pret: "Loan ?",
			somme_empruntee: "How much ?",
			recommende: "Recommand ?",
			ressenti_langue: "How did you feel language use ?",
			surprise: "Something that suprised you",
			made_angry: "Something that made you angry",
			made_laugh: "Something that made you laugh",
			what_missed: "What did you miss the most ?",
			things_appreciated_want_integrate_now: "Are there things from the country where you lived that you want to integrate now ?",
			interact_same_way: "Did people in the country you lived interact the same way ?",
			differrencies_time_organization: "What differences did you notice in the way that time is organized in the country where you lived, as compared to France?",
			advice: "Advice to give to your fellow students ?",
			most_difficult: "What was the most difficult to accustume with ?",
			agresso_ui: "The unique identifier of your mission in AGRESSO"
		}
	},

	groupe_questions: {
		roles: Roles.PUBLIC,
		name: "Questions",
		legend: {
			id: null,
			nom: "Name",
			ordre: "Order",
			texte: "Text",
			optionnelle: "Optionnal ?",
			identifiant: "ID",
			type: "Type"
		},
		unlinkedVar['question']
	},

	echelle_reponse: {
		roles: Roles.PUBLIC,
		name: "Answers",
		legend: {
			id: null,
			nom: "Name",
			texte: "Text"
		},
		unlinkedVar['reponse_possible']
	},
}
