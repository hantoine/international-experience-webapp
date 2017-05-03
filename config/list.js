var Roles = require('../util/roles').Roles;

module.exports = {
	logement: {role: Roles.PUBLIC, name: "Accomodation"},
	ville: {role: Roles.PUBLIC, name: "City"},
	transport: {role: Roles.PUBLIC, name: "Transport"},
	certification: {role: Roles.PUBLIC, name: "Certification"},
	domaine_etude: {role: Roles.PUBLIC, name: "Field of study"},
	etudiant: {role: Roles.PUBLIC, name: "Student"},
	langue: {role: Roles.PUBLIC, name: "Languages"},
	pays: {role: Roles.PUBLIC, name: "Country"},
	avantage_inconvenient: { role: Roles.PUBLIC, name: "Advantage/Disadvantage"}
	organisation: {role: Roles.PUBLIC, name: "Organisation"},
	avantage_inconvenient: { role: Roles.NOBODY, name: "Advantage/Disadvantage"},
	continent: {role: Roles.PUBLIC, name: "Continent"},
	groupe_questions: {role: Roles.PUBLIC, name: "Questions"},
	echelle_reponse: {role: Roles.PUBLIC, name: "Answers"}
}

