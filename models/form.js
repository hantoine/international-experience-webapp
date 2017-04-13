var async = require('async');
var db = require('../db.js')

exports.QuestionType = {
	SELECT : 0,
	CHOICE: 1,
	INT: 2,
	TEXT: 3,
	EXT: 4
};

exports.getFormGroupsStates = function(expid, done) {
	db.get().query('SELECT g.id_groupe_questions AS id, g.nom, MAX(e.id_experience = ?) AS to_fillin FROM `groupe_questions` AS g LEFT JOIN `experience` AS e ON g.id_groupe_questions = e.id_groupe_questions GROUP BY g.id_groupe_questions ORDER BY `ordre`', expid, function(err, rows) {
		if (err) return done(err);
		var to_fillin_passed = false;
		for(var i = 0; i < rows.length; i++) {
			if(to_fillin_passed) {
				delete rows[i].to_fillin;
				continue;
			}
			if(rows[i].to_fillin) {
				delete rows[i].to_fillin;
				rows[i].todo = true;
				to_fillin_passed = true
				continue;
			}
			delete rows[i].to_fillin;
			rows[i].done = true;

		}
		console.log(rows);
		done(null, rows);
	});
}

var getFormGroup = function(byName, identifier, done) {
	var dealWithQuestions = function(err, rows) {
		if(err) return done(err);
		asyncRequests = []
		for (var i = 0 ; i < rows.length ; i++) {
			// Transform reponses into an array
			if(rows[i].reponses) {
				rows[i].reponses = rows[i].reponses.split(';');
			}
			// Transform optionelle into boolean
			rows[i].optionelle = (rows[i].optionelle != 0);
			
			// If question is a selection in an object list, get the possible answers
			if(rows[i].type == exports.QuestionType.EXT) {
				asyncRequests.push((function(j) { return function(callback) {
					db.get().query('SELECT id_' + rows[j].identifiant + ' AS id, nom FROM ' + rows[j].identifiant, function(err, result) {
						if(err) return callback(err);
						reponses = {};
						for (var k = 0 ; k < result.length ; k++) {
							reponses[result[k].id] = result[k].nom;
						}
						rows[j].reponses = reponses;
						callback();
					});
				}})(i));
			}
		}
		async.parallel(asyncRequests, function(err){
			if(err) return done(err);
			done(null, rows);
		});
		// Removing no more necessary attribute
		for (var i = 0 ; i < rows.length ; i++) {
			delete rows[i].identifiant;
		}
	};
	if(byName) {
		db.get().query('SELECT q.texte, q.optionelle, q.type, q.identifiant, GROUP_CONCAT(r.texte ORDER BY r.numero ASC SEPARATOR \';\') AS reponses FROM groupe_questions AS g JOIN `question` AS q ON q.id_groupe_questions = g.id_groupe_questions LEFT JOIN `reponse_possible` AS r ON q.id_echelle_reponse = r.id_echelle_reponse WHERE g.nom = ? GROUP BY q.id_question ORDER BY q.ordre', identifier, dealWithQuestions);
	} else {
		db.get().query('SELECT q.texte, q.optionelle, q.type, q.identifiant, GROUP_CONCAT(r.texte ORDER BY r.numero ASC SEPARATOR \';\') AS reponses FROM `question` AS q LEFT JOIN `reponse_possible` AS r ON q.id_echelle_reponse = r.id_echelle_reponse WHERE q.id_groupe_questions = ? GROUP BY q.id_question ORDER BY q.ordre', identifier, dealWithQuestions);
	}
};

exports.getFormGroupById = function(id, done) {
	getFormGroup(false, id, done);
}

exports.getFormGroupByName = function(name, done) {
	getFormGroup(true, name, done);
}
