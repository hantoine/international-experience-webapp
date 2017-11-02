var db = require('../db');
var async = require('async');

// generate the SQL command creating the experience view containing all informations given in questions's answers
var builCreateExperienceViewOnlyNumQuery = function(callback) {
	var query = "CREATE OR REPLACE VIEW experience_onlyrid_view AS SELECT `e`.`id_experience` AS `id`, ";
	var vars = [];
	var joins = [];
	var joinAliases = [];
	
	var updateVarsJoinWithQuestion = function(question, callback) {
		// not multiple choice question
		if (question.identifiant) {
			if(['id_pays', 'id_ville'].includes(question.identifiant))
				return callback();
			if(question.identifiant.slice(0,2) == "2:") { 	// ext identifier format 2
				//example: 2:id_organisation->organisation/id_ville->ville/id_pays->pays/nom
				var nodes = question.identifiant.slice(2).split('/');
				
				// Adding the joins when not already present in the query
				for(var i = 0; i < nodes.length-1;i++) {
					nodes[i] = nodes[i].split('->');
					var j = 1;
					do {
						if (j > 1) {
							nodes[i][2] = nodes[i][1] + j;
						}
						var current_join = "LEFT JOIN `" + nodes[i][1] + "` "+ ((nodes[i][2]) ? ("AS `"+nodes[i][2] + "` ") : "") + "on(`"+ ((i == 0) ? "e" : (nodes[i-1][2] || nodes[i-1][1])) +"`.`"+nodes[i][0]+"` = `"+(nodes[i][2] || nodes[i][1])+"`.`id_"+nodes[i][1]+"`)"
						if(joins.includes(current_join)) {
							break;
						}
						j += 1;
					} while(joinAliases.includes(nodes[i][2] || nodes[i][1]));
					if(joins.includes(current_join)) {
						continue;
					}
					joins.push(current_join);
					joinAliases.push(nodes[i][2] || nodes[i][1]);
				}
				
				//Adding the variable
				vars.push('`' + (nodes[nodes.length-2][2] || nodes[nodes.length-2][1]) + '`.`' + nodes[nodes.length-1] + "` AS `" + (question.name || nodes[nodes.length-2][1]+"_"+nodes[nodes.length-1]) + "`");
				
			} else if(question.identifiant.includes('/')) { // ext identifier legacy format
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
				var contentTableAlias;
				var j = 1;
				do {
					if (j > 1) {
						contentTableAlias = contentTable + i;
					}
					var current_join = "LEFT JOIN `" + contentTable + "` "+ ((contentTableAlias) ? ("AS `"+contentTableAlias + "` ") : "") + "on(`e`.`"+linkingAttribute+"` = `"+(contentTableAlias || contentTable)+"`.`id_"+contentTable+"`)"
					if(joins.includes(current_join)) {
						break;
					}
					j += 1;
				} while(joinAliases.includes(contentTableAlias || contentTable));
				if(!joins.includes(current_join)) {
					joinAliases.push(contentTableAlias || contentTable);
					joins.push(current_join);		
				}
				vars.push('`' + contentTable + '`.`' + contentAttribute + '` AS `' + (question.name || linkingAttribute+'_'+contentAttribute) + "`");				
			} else {
				vars.push('`e`.`'+question.identifiant+'` AS `' + (question.name || question.identifiant) + "`");
				// If question is an EXT reference add name variable
				if(question.identifiant.slice(0,3) == 'id_') {
					var contentTable = question.identifiant.slice(3);
					var contentTableAlias;
					var j = 1;
					do {
						if (j > 1) {
							contentTableAlias = contentTable + i;
						}
						var current_join = "LEFT JOIN `" + contentTable + "` "+ ((contentTableAlias) ? ("AS `"+contentTableAlias + "` ") : "") + "on(`e`.`"+question.identifiant+"` = `"+(contentTableAlias || contentTable)+"`.`"+question.identifiant+"`)"
						if(joins.includes(current_join)) {
							break;
						}
						j += 1;
					} while(joinAliases.includes(contentTableAlias || contentTable));
					if(!joins.includes(current_join)) {
						joinAliases.push(contentTableAlias || contentTable);
						joins.push(current_join);		
					}
					vars.push('`' + contentTable + '`.`nom` AS `' + (question.name || question.identifiant) + " name`");				
				}
			}
		} else {
			vars.push("sum(case when `ar`.`id_question` = '" + question.id + "' then `ar`.`id_reponse_possible` else NULL end) AS `" + (question.name || question.id) + " rid`")
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

var createExperienceViewOnlyNum = function(callback){
	builCreateExperienceViewOnlyNumQuery(function(err, query) {
		if(err) return callback(err);
		db.get().query(query, callback);
	});
}


var createExperienceView = function(callback) {
	var query = "CREATE OR REPLACE VIEW experience_view AS SELECT `e`.*, ";
	var vars = [];
	var joins = [];
	db.get().query("SELECT `COLUMN_NAME` AS `col` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='intl_data' AND `TABLE_NAME`='experience_onlyrid_view' AND `COLUMN_NAME` LIKE '%rid'", function(err, result){
		if(err) return callback(err);
		
		for(var i = 0 ; i < result.length; i++) {
			var varName = result[i].col.slice(0, -4);
			vars.push("`rp "+varName+"`.texte AS `"+varName+"`")
			vars.push("`rp "+varName+"`.numero AS `"+varName+" num`")
			joins.push("LEFT JOIN reponse_possible `rp "+varName+"` ON (`rp "+varName+"`.id_reponse_possible = e.`"+varName+" rid`)");
		}
		query += vars.join(", ");
		query += "FROM experience_onlyrid_view e ";
		query += joins.join(" ");
		db.get().query(query, callback);
	});
}

exports.updateExperienceView = function(callback) {
	createExperienceViewOnlyNum(function(err)
	{
		if(err) return callback(err);
		createExperienceView(callback)
	})
};
