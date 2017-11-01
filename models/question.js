var db = require('../db');
var async = require('async');

// generate the SQL command creating the experience view containing all informations given in questions's answers
var builCreateViewQuery = function(callback) {
	var query = "CREATE OR REPLACE VIEW experience_view_exp AS SELECT `e`.`id_experience` AS `id_experience`, ";
	var vars = [];
	var joins = [];
	var joinAliases = [];
	var updateVarsJoinWithQuestion = function(question, callback) {
		// not multiple choice question
		if (question.identifiant) {
			// ext question
			if(['id_pays', 'id_ville'].includes(question.identifiant))
				return callback();
			if(question.identifiant.includes('/')) {
				// id example : "id_avantage_logement/logement/critiquer_logement/avantage_inconvenient/contenu=?,avantage=1,displayed=1"
				// other id example: "id_etudiant///etudiant/prenom=?"					
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
				var contentTableAlias = contentTable
				if(!joinAliases.includes(contentTableAlias)) {
					joins.push('LEFT JOIN `' + contentTable + '` on(`e`.`' + linkingAttribute + '` = `' + contentTable+'`.`id_'+contentTable+'`)');
				} else {
					var i = 1;
					do {
						i += 1;
						contentTableAlias = contentTable + i;
					} while(joinAliases.includes(contentTableAlias));
					joins.push('LEFT JOIN `' + contentTable + '` AS `' + contentTableAlias + '` on(`e`.`' + linkingAttribute + '` = `' + contentTableAlias +'`.`id_'+contentTable+'`)');
				}
				joinAliases.push(contentTableAlias);
				vars.push('`' + contentTable + '`.`' + contentAttribute + '` AS `' + (question.name || linkingAttribute+'_'+contentAttribute) + "`");
			} else {
				vars.push('`e`.`'+question.identifiant+'` AS `' + (question.name || question.identifiant) + "`");
			}
		} else {
			//sum(case when `ar`.`id_question` = '1' then `ar`.`numero` else NULL end) AS `study_year`
			vars.push("sum(case when `ar`.`id_question` = '" + question.id + "' then `ar`.`numero` else NULL end) AS `" + (question.name || question.id) + "`")
		}
		callback()
	};
	
	db.get().query("SELECT id_question AS id, identifiant, name FROM `question`", function(err, result) {
		if(err) return callback(err);

		async.each(result, updateVarsJoinWithQuestion, function(err) {
			if(err) return callback(err);
			joins.push('left join `avoir_reponse` `ar` on(`e`.`id_experience` = `ar`.`id_experience`)');
			query += vars.join(', ');
			query += " FROM `experience` AS `e` ";
			query += joins.join(' ');
			query += " GROUP BY `e`.`id_experience`";
			callback(null, query);
		});
	});
};


exports.updateExperienceView = function(callback) {
	builCreateViewQuery(function(err, query) {
		if(err) return callback(err);
		db.get().query(query, function(err) {
			callback(err);
		})
	});
};
