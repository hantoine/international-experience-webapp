var db = require('../db.js');
var async = require('async');
var config = require('../config.js')

exports.QuestionType = {
	SELECT : 0,
	CHOICE: 1,
	INT: 2,
	TEXT: 3,
	EXT: 4,
	TEXTAREA: 5,
	BOOL: 6
};

var addExtTables = function(table, extTables) {
	if(! extTables) {
		return '';
	}
	query = '';
	for (var i=0 ; i < extTables.length ; i++) {
		query += ' JOIN `' + extTables[i].table + '` ON `' + extTables[i].table + '`.`id_' + extTables[i].table + '` = `' + table + '`.`id_' + extTables[i].table + '`';
		query += addExtTables(extTables[i].table, extTables[i].extTables);
	}
	return query;
}

exports.get = function(table) {
	var model = {}
	model.getList = function(attributes, conditions, extTables, groupby, orderby, limit, done) {
		if(conditions) {
			Object.keys(conditions).forEach((key) => (conditions[key] == null) && delete conditions[key]);
		}
		query = 'SELECT `' + table + '`.`id_'+ table + '` AS id'
		if(attributes) {
			for (var i=0 ; i<attributes.length ; i++) {
				if(attributes[i].includes('.')) {
					query += ', `' + attributes[i].split('.')[0] + '`.`' + attributes[i].split('.')[1] + '`';
				} else if (attributes[i].includes('(')){
					if( !['AVG', 'MAX', 'MIN', 'COUNT', 'STDDEV', 'GROUP_CONCAT'].includes(attributes[i].split('(')[0])) {
						console.log("Warning: bad formatted column ignored : \""+attributes[i]+"\"");
						continue;
					}
					query += ', ' + attributes[i].split('(')[0] + '(' + db.e(attributes[i].split('(')[1].split(')')[0]) + ')';
				} else {
					query += ', `' + table + '`.`' + attributes[i] + '`';
				}
			}
		}
		query += ' FROM ' + table;
		query += addExtTables(table, extTables);
		if(conditions && Object.keys(conditions).length != 0) {
			query += ' WHERE ';
			for (var lastCondition in conditions);
			for (var condition in conditions) {
				var conditionString = '';
				if(condition.includes('.')) {
					conditionString = '`' + condition.split('.')[0] + '`.`' + condition.split('.')[1] + '`';
				} else if (condition.includes('(')){
					if( !['AVG', 'MAX', 'MIN', 'COUNT', 'STDDEV', 'GROUP_CONCAT'].includes(condition.split('(')[0])) {
						query += ' 1 = 1 ';
						console.log("Warning: bad formatted condition ignored : \""+condition+"\"");
						continue;
					}
					conditionString = condition.split('(')[0] + '(' + db.e(condition.split('(')[1].split(')')[0]) + ')';
				} else {
					conditionString = '`' + table + '`.`' + condition + '`';
				}

				if(typeof(conditions[condition]) == 'object') {
					var conditionValue = conditions[condition];
					query += conditionString + ' ';
					var operators = ['=', '>', '<', '<=', '>=', 'contains', 'in', 'between', 'match regexp'];
					var operatorString = {
						'=':'=',
						'>':'>',
						'<':'<',
						'<=': '<=',
						'>=':'>=',
						'contains': 'LIKE',
						'in':'IN',
						'between':'BETWEEN',
						'match regexp': 'REGEXP',
						'contains words': ''
					};
					query += operatorString[conditionValue.operator] + ' ';
					if(conditionValue.operator == 'contains') {
						query += db.get().escape('%'+conditionValue.value+'%');
					} else if(conditionValue.operator == 'in') {
						var values = conditionValue.value.split(' ');
						var valuesQuery = [];
						for (var i = 0 ; i < values.length ; i++) {
							valuesQuery.push(db.get().escape(values[i]))
						}
						query += ' (' + valuesQuery.join(', ') + ')';
					} else if (conditionValue.operator == 'between') {
						query += db.get().escape(conditionValue.value.split(' ')[0]) + ' AND ' + db.get().escape(conditionValue.value.split(' ')[1]);
					} else if (conditionValue.operator == 'contains words') {
						var values = conditionValue.value.split(' ');
						var valuesQuery = [];
						query += 'LIKE ' + (db.get().escape('%'+values[0]+'%') || '\'\'');
						if(values.length > 1) {
							query += ' OR '
							for (var i = 1 ; i < values.length; i++) {
								valuesQuery.push(conditionString + ' LIKE ' + db.get().escape('%'+values[i]+'%'));
							}
							query += valuesQuery.join(' OR ');
						}
					}	else {
						console.log(conditionValue.value);
						query += db.get().escape(conditionValue.value);
					}
				} else {
					query += conditionString + ' = ' + db.get().escape(conditions[condition]);
				}

				if(condition != lastCondition) {
					query += ' AND ';
				}
			}
		}
		if(groupby) {
			if(groupby.includes('.'))
				query += ' GROUP BY `' + groupby.split('.')[0] + '`.`' + groupby.split('.')[1] + '`';
			else
				query += ' GROUP BY `' + groupby + '`';
		}
		if(orderby && orderby.length) {
			query += ' ORDER BY ';
			formattedOrderBy = [];
			for (var i = 0 ; i < orderby.length; i++) {
				if(orderby[i].includes('.'))
					formattedOrderBy.push('`' + orderby[i].split('.')[0] + '`.`' + orderby[i].split('.')[1] + '`');
				else if (orderby[i].includes('(')){
						if( !['AVG', 'MAX', 'MIN', 'COUNT', 'STDDEV', 'GROUP_CONCAT'].includes(orderby[i].split('(')[0])) {
							return done("Error: bad formatted order by : \""+orderby[i]+"\"");
						}
						formattedOrderBy.push(orderby[i].split('(')[0] + '(' + db.e(orderby[i].split('(')[1].split(')')[0]) + ')')
					}
				else
					formattedOrderBy.push('`' + orderby[i] + '`');
			}
			query += formattedOrderBy.join(', ');
		}

		query += " ";
		if(limit) {
			query += ' LIMIT ';
			if(typeof(limit) == 'number')
				query += limit;
			else
				query += limit.size + ' OFFSET ' + limit.offset;
		}

		db.get().query(query, function(err,rows) {
			if(err) return done(err);
			var unlimitedQuery = query.slice(0, query.lastIndexOf("LIMIT"));
			db.get().query("SELECT COUNT(*) AS nb FROM ("+unlimitedQuery+") as countTable", function(err, res){
				if(err) return done(err);
				done(null, rows, res[0].nb);
			})
		});
	};
	model.getColumns = function(done) {
		db.get().query("SELECT `COLUMN_NAME` AS `col` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='"+ config.databaseParams.database +"' AND `TABLE_NAME`='"+table+"'", function(err, result){
			if(err) return done(err);
			var cols = [];
			for (var i = 0; i < result.length ; i++) {
				cols.push(result[i].col);
			}
			done(null, cols);
		});
	}

	model.createNew = function(initValues, done) {
		attributes = ''
		values = ''
		for(var lastInitValue in initValues);
		for(var initValue in initValues) {
			attributes += '`'+ initValue + '`';
			values += db.escape(initValues[initValue]);
			if( initValue != lastInitValue ) {
				attributes += ',';
				values += ',';
			}
		}
		var query = 'INSERT INTO ' + table + ' (' + attributes + ') VALUES (' + values + ')'
		db.get().query(query, function(err, result) {
			if(err) return done(err);
			done(null, result.insertId);
		});
	};
	model.update = function(id, values, done) {
		query = 'UPDATE `'+ table + '` SET ';


		for(var lastValue in  values);
		for(var value in  values) {
			query += '`' + value + '` = ' + db.escape(values[value]);
			if( value != lastValue ) {
				query += ', ';
			}
		}
		query += ' WHERE `id_' + table +'` = ' + db.escape(id);
		db.get().query(query, function(err) {
			if(err) return done(err);
			done(null);
		});
	};
	model.delete = function(id, done) {
		db.get().query('DELETE FROM `' + table + '` WHERE `id_' + table + '` = ' + db.escape(id), function(err) {
			done(err);
		});
	};

	model.getById = function(id, raw, legend, done) {
		db.get().query('SELECT * FROM `' + table + '` WHERE `id_' + table + '` = ' + db.escape(id), function(err, result) {
			if(err) return done(err);
			if(result.length < 1) {
				return done("No object found by that id");
			}
			var object = result[0];
			var asyncRequests = [];
			if (legend) {
				for (var key in legend) {
					if((typeof legend[key] == 'object') && (legend[key] != null)) {
						switch(legend[key].type) {
							case 'list':
								asyncRequests.push((function(key) { return function(callback) {
									var query = 'SELECT c.`id_' + legend[key].contentTable + '` AS id, c.`' + legend[key].descAttribute + '` AS nom FROM `' + legend[key].contentTable + '` AS c JOIN `' + legend[key].relationTable + '` AS j ON j.`id_' + legend[key].contentTable + '` = c.`id_' + legend[key].contentTable + '` WHERE j.`id_' + table + '` = ' + db.escape(id);
									for (var attribute in legend[key].conditions) {
										query += ' AND `' + attribute + '` = ' + db.escape(legend[key].conditions[attribute]);
									}
									db.get().query(query, function(err, result) {
										if(err) return callback(err);
										object[key] = result;
										callback();
									});
								}})(key));
								break;
							default:
								console.log("Error while retreiving data for object " + table + " : legend item type unknown (" + legend[key].type + ")");
						}
					}
				}
			}
			if(raw) {
				object['id'] = object['id_' + table];
				delete object['id_' + table];
				for(var key in object) {
					if(key.substr(0, 3) == 'id_') {
						object[key.substr(3)] = object[key];
						delete object[key];
					}
				}
				return done(null, object);
			}
			object.id = object['id_'+table];
			delete object['id_'+table];
			for(var key in object) {
				if(key.substr(0, 3) == 'id_')
				{
					if(object[key]) {
						asyncRequests.push((function(key) {
						return function(callback) {
							var subTable = key.substr(3);
							var query = 'SELECT `' + key +'` AS id, nom FROM `' + subTable + '` WHERE `' + key + '` = ' + db.escape(object[key]);
							db.get().query(query, function(err, res) {
								if(err) return callback(err);
								if(res.length < 1) {
									return callback("No entry corresponding to id " + object[key] + " in " + subTable);
								}
								object[subTable] = {id: res[0].id, nom: res[0].nom};
								delete object[key];
								callback();
							});
						}
						})(key));
					} else {
						object[key.substr(3)] = null;
						delete object[key];
					}
				}
			}
			async.parallel(asyncRequests, function(err) {
				if(err) return done(err);
				done(null, object);
			});
		});
	};
	model.completeLegend = function(legend, done) {
		if(! legend) {
			return done("legend should be defined");
		}
		db.get().query("SELECT column_name, is_nullable, data_type, character_maximum_length  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = " + db.escape(table), function(err, result) {
			if(err) return done(err);
			for (var i=0; i < result.length; i++) {
				if(result[i].column_name == 'id_' + table) {
					continue;
				} else if (result[i].column_name.substr(0, 3) == 'id_') {
					var key = result[i].column_name.substr(3);
				} else {
					var key = result[i].column_name;
				}
				if(! legend[key]) {
					return done("Erreur : L'attribut " + key + " n'est pas configuré pour " + table);
				}
				legend[key].optionel = (result[i].is_nullable == 'YES')
				legend[key].data_type = result[i].data_type;
				legend[key].max_length = result[i].character_maximum_length;
			}
			var asyncRequests = []
			for (var key in legend) {
				if(legend[key].type == exports.QuestionType.EXT){

					asyncRequests.push((function (key) { return function(callback) {
						db.get().query('SELECT `id_'+key+'` AS id, nom FROM `' + key + '`', function(err, result) {
							if(err) return callback(err);
							reponses = {};
							for (var k = 0 ; k < result.length ; k++) {
								reponses[result[k].id] = result[k].nom;
							}
							legend[key].answers = reponses;
							callback();
						});
					}})(key));
				}
			}
			async.parallel(asyncRequests, function(err) {
				if(err) return done(err);
				done(null);
			});
		});
	};

	return model;
};

