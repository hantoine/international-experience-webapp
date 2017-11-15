var async = require('async');
var db = require('../db.js')
var newAuthorizations = require('../config/new');
exports.QuestionType = {
	SELECT : 0,
	CHOICE: 1,
	INT: 2,
	TEXT: 3,
	EXT: 4,
	TEXTAREA: 5,
	BOOL: 6,
	HORIZONTAL_CHOICE: 7,
	EXT_TEXTAREA: 8,
	EXT_TEXT: 9
};

exports.getFormGroupsStates = function(expid, done) {
	db.get().query('SELECT g.id_groupe_questions AS id, g.need_experience_done, g.nom, MAX(e.id_experience = ?) AS to_fillin FROM `groupe_questions` AS g LEFT JOIN `experience` AS e ON g.id_groupe_questions = e.id_groupe_questions GROUP BY g.id_groupe_questions ORDER BY `ordre`', expid, function(err, rows) {
		if (err) return done(err);
		db.get().query('SELECT done FROM experience WHERE id_experience = ?', expid, function(err, result) {
			if(err) return done(err);
			if(result.length < 1) return done('Erreur while getting form group states : No experience by that id (' + expid + ')');
			var to_fillin_passed = false;
			var need_done_to_continue = false;
			for(var i = 0; i < rows.length; i++) {
				if(to_fillin_passed) {
					delete rows[i].to_fillin;
					rows[i].done = false;
					continue;
				}
				if(rows[i].to_fillin) {
					delete rows[i].to_fillin;
					if(rows[i].need_experience_done && (! result[0].done)) {
						rows[i].todo = false;
						rows[i].done = false;
						need_done_to_continue = true;
					} else {
						rows[i].todo = true;
						rows[i].done = false;
					}
					to_fillin_passed = true
					continue;
				}
				delete rows[i].to_fillin;
				rows[i].done = true;
	
			}
			done(null, {state: need_done_to_continue, formgroups: rows, expDone: result[0].done});
		});
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
				rows[i].role = newAuthorizations[rows[i].identifiant.substr(3)]
				if(typeof rows[i].role == 'undefined') {
					rows[i].role = 10;
				}
			}
		}
		async.parallel(asyncRequests, function(err){
			if(err) return done(err);
			done(null, rows);
		});
	};
	if(byName) {
		db.get().query('SELECT q.id_question AS id, q.texte, q.optionelle, q.type, q.identifiant, GROUP_CONCAT(r.texte ORDER BY r.numero ASC SEPARATOR \';\') AS reponses FROM groupe_questions AS g JOIN `question` AS q ON q.id_groupe_questions = g.id_groupe_questions LEFT JOIN `reponse_possible` AS r ON q.id_echelle_reponse = r.id_echelle_reponse WHERE g.nom = ? AND q.enabled = "1" GROUP BY q.id_question ORDER BY q.ordre', identifier, dealWithQuestions);
	} else {
		db.get().query('SELECT q.id_question AS if, q.texte, q.optionelle, q.type, q.identifiant, GROUP_CONCAT(r.texte ORDER BY r.numero ASC SEPARATOR \';\') AS reponses FROM `question` AS q LEFT JOIN `reponse_possible` AS r ON q.id_echelle_reponse = r.id_echelle_reponse WHERE q.id_groupe_questions = ? AND q.enabled = "1" GROUP BY q.id_question ORDER BY q.ordre', identifier, dealWithQuestions);
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
				db.get().query('UPDATE `experience` AS e \
					JOIN groupe_questions AS g_old ON e.id_groupe_questions = g_old.id_groupe_questions\
					JOIN groupe_questions AS g_new ON ? = g_new.id_groupe_questions\
					SET e.id_groupe_questions = CASE\
					WHEN g_new.ordre > g_old.ordre\
					THEN ?\
					ELSE e.id_groupe_questions\
					END\
					WHERE e.id_experience = ?', [result_nextone[0].id, result_nextone[0].id, expid], function(err) {
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
	var asyncRequests = [];
	var gen = function(d) {
		console.log('next_form_page = form.click_button');
		console.log('form = next_form_page.form_with!()');
		for(var q in d) {
			console.log("form['"+q+"'] = '"+d[q]+"'");
		}
	};
	gen(data);
	for (var question in data) {
		asyncRequests.push((function (question) { return function(callback){
		db.get().query("SELECT identifiant, type FROM `question` WHERE id_question = ?", question, function(err, result) {
			if(err) return callback("Error while saving question " + question + " : " + err);
			if(result.length < 1) {
				return callback("Question " + question + " not found");
			}
			if(result[0].identifiant == 'id_ville' || result[0].identifiant == 'id_pays') {
				return callback();
			}
			switch(result[0].type) {
				case exports.QuestionType.SELECT:
				case exports.QuestionType.CHOICE:
				case exports.QuestionType.HORIZONTAL_CHOICE:
					db.get().query("INSERT INTO `avoir_reponse` (`numero`, `id_experience`, `id_question`, `id_reponse_possible`) \
SELECT ? AS `numero`, ? AS `id_experience`, ? AS `id_question`, rp.id_reponse_possible AS `id_reponse_possible` from question q JOIN reponse_possible rp ON \
 (q.id_echelle_reponse = rp.id_echelle_reponse) WHERE q.id_question= ? AND rp.numero = ? \
ON DUPLICATE KEY UPDATE `numero` = VALUES(`numero`), `id_reponse_possible`= VALUES(`id_reponse_possible`)", [data[question], expid, question, question, data[question]], function(err) {
						if(err) callback("Error while saving question " + question + " : " + err);
						callback();
					});
					break;
				case exports.QuestionType.INT:
				case exports.QuestionType.TEXT:
				case exports.QuestionType.BOOL:
				case exports.QuestionType.TEXTAREA:
				case exports.QuestionType.EXT:
					if(! result[0].identifiant ) {
						return callback("Erreur : Identifiant vide pour question " + question)
					}
					db.get().query('UPDATE experience SET ' + result[0].identifiant + ' = ? WHERE id_experience = ?', [data[question], expid], function(err) {
						if(err) return callback("Error while saving question " + question + " : " + err + "(" + result[0].identifiant + ", " + data[question] + ", " + expid + ")");
						callback();
					});
					break
				case exports.QuestionType.EXT_TEXTAREA:
				case exports.QuestionType.EXT_TEXT:
					if(! result[0].identifiant ) {
						return callback("Erreur : Identifiant vide pour question " + question)
					}
					if(result[0].identifiant.slice(0,2) == "2:") {
						console.log("Identifiant format V2 not implemented here.");
						return callback();
					}
					// id example : "id_avantage_logement/logement/critiquer_logement/avantage_inconvenient/contenu=?,avantage=1,displayed=1"
					// other id example: "id_etudiant///etudiant/prenom=?"					
					// Parsing of "identifiant"
					var splitId = result[0].identifiant.split('/');
					var linkingAttribute = splitId[0];
					var relatedTable = splitId[1]
					var linkingTable = 	splitId[2];
					var contentTable = splitId[3];
					var contentTab = splitId[4].split(',')
					var content = {}
					var contentAttribute = null;
					for (var i=0; i < contentTab.length ; i++) {
						var contentAttributeValue = contentTab[i].split('=');
						if(contentAttributeValue[1] == '?') {
							content[contentAttributeValue[0]] = data[question];
							contentAttribute = contentAttributeValue[0];
						} else {
							content[contentAttributeValue[0]] = contentAttributeValue[1];
						}
					}
					
					// Test if there is already an entry for this experience
					db.get().query('SELECT `' + linkingAttribute + '` AS id FROM experience WHERE id_experience = ' + db.escape(expid), function(err, result) {
						if(err) return callback('Error while saving question ' + question + " : " + err);
						if(result.length < 1) return callback('Experience ' + exid + ' does not exist');
						if(result[0].id == null) {
							query = 'INSERT INTO `' + contentTable + '` (';
							for (var lastKey in content);
							for (var key in content) {
								query += '`' + key + '`';
								if(key != lastKey) {
									query += ',';
								}
							}
							query += ') VALUES ('
							for (var key in content) {
								query += db.escape(content[key]);
								if(key != lastKey) {
									query += ',';
								}
							}
							query += ')'
							// If not Insert the content entry
							db.get().query(query, function(err, result) {
								if(err) return callback('Error while saving question ' + question + " : " + err);
								var contentEntryId = result.insertId;
								// Get related Entry if any to link the content entry withe the related one
								if(relatedTable) {
									var query = 'SELECT `id_' + relatedTable + '` AS id FROM experience WHERE id_experience = ' + db.escape(expid);
									db.get().query(query, function(err, result) {
										if(err) return callback('Error while saving question ' + question + " : " + err);
										if(result.length < 1) return callback('Error while saving question ' + question + " : no corresponding related entry");
										var relatedEntryId = result[0].id;
										//Insert linking entry in relationTable
										var query = 'INSERT INTO `' + linkingTable + '` (`id_' + contentTable + '`, `id_' + relatedTable + '`) VALUES (' + db.escape(contentEntryId) + ',' + db.escape(relatedEntryId) + ')'
										db.get().query(query, function(err) {
											if(err) return callback('Error while saving question ' + question + " : " + err);
											// Update Direct link in experience entry
											var query = 'UPDATE experience SET `' + linkingAttribute + '` = ' + db.escape(contentEntryId) + ' WHERE id_experience = ' + db.escape(expid);
											db.get().query(query, function(err) {
												if(err) return callback('Error while saving question ' + question + " : " + err);
												callback();
											});
										});
									});
								}
							});
						} else {
							// If yes just update it 
							db.get().query(	'UPDATE `' + contentTable + '` SET `' + contentAttribute + '` = ' + db.escape(data[question]) + 
									' WHERE `id_' + contentTable + '` = ' + db.escape(result[0].id), function(err) {
								if(err) return callback('Error while saving question ' + question + " : " + err);
								callback();
							});
						}
					});
					
			}

		});
		}
		})(question));
	}

	async.parallel(asyncRequests, done);
}

exports.addAnswers = function(expid, formgroup, done) {
	async.each(formgroup, function(question, callback) {
		switch(question.type) {
			case exports.QuestionType.SELECT:
			case exports.QuestionType.CHOICE:
			case exports.QuestionType.HORIZONTAL_CHOICE:
				db.get().query('SELECT `numero` FROM `avoir_reponse` WHERE `id_experience` = ? AND `id_question` = ?', [expid, question.id], function(err, result) {
					if(err) {
						return done("Error while reading answer to question " + question + " : " + err);
					} else if(result.length > 0) {
						question.prec_reponse = result[0].numero;
						callback()
					} else {
						callback('Erreur : Pas d\'echelle de réponses pour question '+ question.id);
					}
				});
				break;
			case exports.QuestionType.INT:
			case exports.QuestionType.TEXT:
			case exports.QuestionType.BOOL:
			case exports.QuestionType.TEXTAREA:
			case exports.QuestionType.EXT:
				if(! question.identifiant ) {
					return callback("Erreur : Pas d'Identifiant pour question " + question.id);
				}
				db.get().query('SELECT ' + question.identifiant + ' AS reponse FROM experience WHERE id_experience = ?', expid, function(err, result) {
					if(err) {
						console.log("Error while reading answer to question " + question + " : " + err);
					} else if (result.length >0) {
						question.prec_reponse = result[0].reponse;
					}
					callback();
				});
				break;
			case exports.QuestionType.EXT_TEXTAREA:
			case exports.QuestionType.EXT_TEXT:
				if(question.identifiant.slice(0,2) == "2:") {
					console.log("Identifiant format V2 not implemented here.");
					return callback();
				}
				var splitId = question.identifiant.split('/');
				var linkingAttribute = splitId[0];
				var contentTable = splitId[3];
				var contentTab = splitId[4].split(',')
				var contentAttribute = ''
				for (var i=0; i < contentTab.length ; i++) {
					var contentAttributeValue = contentTab[i].split('=');	
					if(contentAttributeValue[1] == '?') {
						contentAttribute = contentAttributeValue[0];
						break;
					}
				}
				var query = 'SELECT `' + contentAttribute + '` AS content FROM experience AS e LEFT JOIN `' + contentTable + '` AS c ON e.`' + linkingAttribute + '` = c.`id_' + contentTable + '` WHERE id_experience = ' + db.escape(expid);
				db.get().query(query, function(err, result) {
					if(err) return callback(err);
					question.prec_reponse = result[0].content;
					callback();
				});
				
		}
	}, done);
};
