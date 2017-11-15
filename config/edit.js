var Roles = require('../util/roles').Roles;
var QuestionType = require('../models/generic.js').QuestionType;
module.exports = {
	logement: {
		role: Roles.STUDENT,
		name: "Accommodation",
		legend: {
			nom: { text: "Name", type: QuestionType.TEXT },
			prix: { text: "Price", type: QuestionType.INT },
			ville: {text: "City", type: QuestionType.EXT},
			type_logement: {text: "Type of accommodation", type: QuestionType.EXT},
			adresse: {text: "Address", type: QuestionType.TEXT}
		}
	},
	ville: {
		role: Roles.STUDENT,
		name: "City",
		legend: {
			nom: {text: "Name", type: QuestionType.TEXT },
			nb_habitants: {text: "Inhabitants Number", type: QuestionType.INT },
			nb_etudiants: {text: "Students Number", type: QuestionType.INT },
			pays: {text: "Country", type: QuestionType.EXT }
		}
	},
	transport: {
		role: Roles.STUDENT,
		name: "Transport",
		legend: {
			nom: {text:"Name", type: QuestionType.TEXT}
		}
	},
	certification: {
		role: Roles.STUDENT,
		name: "Certification",
		legend: {
			nom: {text: "Name", type: QuestionType.TEXT},
			siteweb: {text: "Website", type: QuestionType.TEXT},
			description: {text: "Description", type: QuestionType.TEXTAREA}
		}
	},

	domaine_etude: {
		role: Roles.STUDENT,
		name: "Field of study",
		legend: {
			nom: {text: "Name", type: QuestionType.TEXT}
		}
	},

	etudiant: {
		role: Roles.STUDENT,
		name: "Student",
		legend: {
			prenom: {text: "Surname", type: QuestionType.TEXT},
			nom: {text: "First Name", type: QuestionType.TEXT}
		}
	},

	langue: {
		role: Roles.STUDENT,
		name: "Languages",
		legend: {
			nom: {text: "Name", type: QuestionType.TEXT}
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
		name: "Organization",
		legend: {
			nom: {text:"Name", type: QuestionType.TEXT},
			nombre_etudiants: {text: "Student Number", type: QuestionType.INT},
			site_web: {text: "Website", type: QuestionType.TEXT},
			prix: {text: "Price", type: QuestionType.INT},
			commentaire: {text:"Comment", type: QuestionTyple.TEXTAREA},
			disponible: {text: "Available", type: QuestionType.BOOL},
			langue: {text: "Language", type: QuestionType.EXT},
			ville: {text: "City", type: QuestionType.EXT},
			estEcole: {text: "Is a school ?", type: QuestionType.BOOL}
		}
	},
	experience: {
		role: Roles.STUDENT,
		name: "Experience",
		legend: {
			age: {text: "Age ?", type: QuestionType.INT},
			duree: {text:"Duration", type:QuestionType.INT},
			competences_acquises: {text:"Skills Acquired", type: QuestionType.TEXTAREA},
			choses_faites: {text:"Things Done", type: QuestionType.TEXTAREA},
			cout: {text:"Price", type: QuestionType.INT},
			cout_location: {text: "Location's Price", type: QuestionType.INT},
			cout_alimentation: {text: "Food's Price", type: QuestionType.INT},
			cout_formation: {text: "Formation's Price", type: QuestionType.INT},
			cout_recherche_agence: {text: "Research's Price", type: QuestionType.INT},
			pret: {text: "Loan ?", type: QuestionType.BOOL},
			somme_empruntee: {text: "How much ?", type: QuestionType.INT},
			recommande: {text: "Recommand ?", type: QuestionType.BOOL},
			ressenti_langue: {text: "How did you feel language use ?", type: QuestionType.TEXTAREA},
			suprise: {text: "Something that suprised you", type: QuestionType.TEXTAREA},
			made_angry: {text: "Something that made you angry", type: QuestionType.TEXTAREA},
			made_laugh: {text: "Something that made you laugh", type: QuestionType.TEXTAREA},
			what_missed: {text: "What did you miss the most ?", type: QuestionType.TEXTAREA},
			things_appreciated_want_integrate_now: {text: "Are there things from the country where you lived that you want to integrate now ?", type: QuestionType.TEXTAREA},
			interact_same_way: {text: "Did people in the country you lived interact the same way ?", type: QuestionType.TEXTAREA},
			differrences_time_organization: {text: "What differences did you notice in the way that time is organized in the country where you lived, as compared to France?", type: QuestionType.TEXTAREA},
			advice: {text: "Advice to give to your fellow students ?", type: QuestionType.TEXTAREA},
			most_difficult: {text: "What was the most difficult to accustume with ?", type: QuestionType.TEXTAREA},
			agresso_ui: {text: "The unique identifier of your mission in AGRESSO", type: QuestionType.TEXT},
		}
	},

	groupe_questions: {
		role: Roles.ADMIN,
		name: "Questions",
		legend: {
			nom: {text: "Name", type: QuestionType.TEXTAREA},
			ordre: {text: "Order", type: QuestionType.INT},
			texte: {text: "Text", type: QuestionType.TEXTAREA},
			optionnelle: {text: "Optionnal ?", type: QuestionType.BOOL},
			identifiant: {text: "ID", type: QuestionType.TEXT},
			type: {text: "Type", type: QuestionType.INT}
		}
	},

	echelle_reponse: {
		role: Roles.ADMIN,
		name: "Answers",
		legend: {
			nom: {text: "Name", type: QuestionType.TEXT},
			texte: {text: "Text", type: QuestionType.TEXTAREA}
		}
	},
}
