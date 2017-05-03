var Roles = require('../util/roles').Roles;

module.exports = {
	logement: Roles.ADMIN,
	ville: Roles.ADMIN,
	avantage_inconvenient: Roles.NOBODY,
	pays: Roles.STUDENT,
	transport: Roles.ADMIN,
	organisation: Roles.STUDENT,
	certification: Roles.ADMIN,
	domaine_etude: Roles.ADMIN,
	etudiant: Roles.ADMIN,
	langue: Roles.ADMIN,
	groupe_questions: Roles.ADMIN,
	echelle_reponses: Roles.ADMIN
}
