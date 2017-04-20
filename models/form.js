var async = require('async');
var db = require('../db.js')

exports.QuestionType = {
	SELECT : 0,
	CHOICE: 1,
	INT: 2,
	TEXT: 3,
	EXT: 4,
	TEXTAREA: 5
};

exports.getFormGroupsStates = function(expid, done) {
	db.get().query('SELECT g.id_groupe_questions AS id, g.nom, MAX(e.id_experience = ?) AS to_fillin FROM `groupe_questions` AS g LEFT JOIN `experience` AS e ON g.id_groupe_questions = e.id_groupe_questions GROUP BY g.id_groupe_questions ORDER BY `ordre`', expid, function(err, rows) {
		if (err) return done(err);
		var to_fillin_passed = false;
		for(var i = 0; i < rows.length; i++) {
			if(to_fillin_passed) {
				delete rows[i].to_fillin;
				rows[i].done = false;
				continue;
			}
			if(rows[i].to_fillin) {
				delete rows[i].to_fillin;
				rows[i].todo = true;
				rows[i].done = false;
				to_fillin_passed = true
				continue;
			}
			delete rows[i].to_fillin;
			rows[i].done = true;

		}
		done(null, rows);
	});
};

exports.getFormGroupNameByOrder = function(order, done) {
	db.get().query('SELECT nom FROM `groupe_questions` WHERE ordre = ?', order, function(err, rows) {
		if(err) return done(err);
		done(null, rows[0].nom);
	});
};

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
					db.get().query('SELECT ' + rows[j].identifiant + ' AS id, nom FROM ' + rows[j].identifiant.substr(3), function(err, result) {
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
	};
	if(byName) {
		db.get().query('SELECT q.id_question AS id, q.texte, q.optionelle, q.type, q.identifiant, GROUP_CONCAT(r.texte ORDER BY r.numero ASC SEPARATOR \';\') AS reponses FROM groupe_questions AS g JOIN `question` AS q ON q.id_groupe_questions = g.id_groupe_questions LEFT JOIN `reponse_possible` AS r ON q.id_echelle_reponse = r.id_echelle_reponse WHERE g.nom = ? GROUP BY q.id_question ORDER BY q.ordre', identifier, dealWithQuestions);
	} else {
		db.get().query('SELECT q.id_question AS if, q.texte, q.optionelle, q.type, q.identifiant, GROUP_CONCAT(r.texte ORDER BY r.numero ASC SEPARATOR \';\') AS reponses FROM `question` AS q LEFT JOIN `reponse_possible` AS r ON q.id_echelle_reponse = r.id_echelle_reponse WHERE q.id_groupe_questions = ? GROUP BY q.id_question ORDER BY q.ordre', identifier, dealWithQuestions);
	}
};

exports.getFormGroupById = function(id, done) {
	getFormGroup(false, id, done);
};

exports.getFormGroupByName = function(name, done) {
	getFormGroup(true, name, done);
};

exports.validateFormGroup = function(questions_completed, formgroupname, expid, done) {
	// We check that all required questions for this formgroup were answered
	db.get().query('SELECT q.id_question AS id FROM `groupe_questions` AS g	JOIN `question` AS q ON g.id_groupe_questions = q.id_groupe_questions WHERE g.nom = ? AND q.optionelle = "0"', formgroupname, function(err, result) {
		if(err) return done(err);
		questions_completed = questions_completed.map(Number);
		for( var i=0; i < result.length; i++) {
			if(questions_completed.indexOf(result[i].id) < 0) {
				return done("Required question " + result[i].id + " was not answered");
			}
		}
		// We get next formgroup id and name
		db.get().query('SELECT r.id_groupe_questions AS id, r.nom AS nextformgroupname FROM `groupe_questions` as g JOIN `groupe_questions` as r ON r.ordre = g.ordre + 1 WHERE g.nom = ?', formgroupname, function(err, result_nextone) {
			if(err) return done(err);
				
			// We update next formgroup id to fillin and send next formgroup name
			if(result_nextone.length > 0) {
				db.get().query('UPDATE `experience` SET id_groupe_questions = ? WHERE id_experience = ?', [result_nextone[0].id, expid], function(err, result_update) {
					if(err) return done(err);
					done(null, result_nextone[0].nextformgroupname);
				});
			} else {
				db.get().query('UPDATE `experience` SET id_groupe_questions = NULL WHERE id_experience = ?', expid, function(err, result_update) {
					if(err) return done(err);
					done(null, null);
				});
			}
		});
	});
};

exports.saveAnswers = function(expid, data, done) {
	for (var question in data) {
		(function (question) {
		db.get().query("SELECT identifiant, type FROM `question` WHERE id_question = ?", question, function(err, result) {
			if(err) return console.log("Error while saving question " + question + " : " + err);
			switch(result[0].type) {
				case exports.QuestionType.SELECT:
				case exports.QuestionType.CHOICE:
					db.get().query('INSERT INTO `avoir_reponse` (`numero`, `id_experience`, `id_question`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `numero` = ?', [data[question], expid, question, data[question]], function(err) {
						if(err) console.log("Error while saving question " + question + " : " + err);
					});
					break;
				case exports.QuestionType.INT:
				case exports.QuestionType.TEXT:
				case exports.QuestionType.TEXTAREA:
				case exports.QuestionType.EXT:
					db.get().query('UPDATE experience SET ' + result[0].identifiant + ' = ? WHERE id_experience = ?', [data[question], expid], function(err) {
						if(err) console.log("Error while saving question " + question + " : " + err);
					});
			}

		});
		})(question);
	}
	
	// Saving while be done eventually, no need to wait for it
	done(null);
}

exports.addAnswers = function(expid, formgroup, done) {
	async.each(formgroup, function(question, callback) {
		switch(question.type) {
			case exports.QuestionType.SELECT:
			case exports.QuestionType.CHOICE:
				db.get().query('SELECT `numero` FROM `avoir_reponse` WHERE `id_experience` = ? AND `id_question` = ?', [expid, question.id], function(err, result) {
					if(err) {
						console.log("Error while reading answer to question " + question + " : " + err);
					} else if(result.length > 0) {
						question.prec_reponse = result[0].numero;
					}
					callback()
				});
				break;
			case exports.QuestionType.INT:
			case exports.QuestionType.TEXT:
			case exports.QuestionType.TEXTAREA:
			case exports.QuestionType.EXT:
				db.get().query('SELECT ' + question.identifiant + ' AS reponse FROM experience WHERE id_experience = ?', expid, function(err, result) {
					if(err) {
						console.log("Error while reading answer to question " + question + " : " + err);
					} else if (result.length >0) {
						question.prec_reponse = result[0].reponse;
					}
					callback();
				});
		}
	}, done);
};
