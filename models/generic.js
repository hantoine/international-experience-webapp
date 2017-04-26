var db = require('../db.js');
var async = require('async');

exports.QuestionType = {
	SELECT : 0,
	CHOICE: 1,
	INT: 2,
	TEXT: 3,
	EXT: 4,
	TEXTAREA: 5,
	BOOL: 6
};

exports.get = function(table) {
	var model = {}
	model.getList = function(conditions, done) {
		query = 'SELECT id_'+ table + ' AS id, nom FROM ' + table;
		if(conditions) {
			query += ' WHERE ';
			for (var lastCondition in conditions);
			for (var condition in conditions) {
				query += '`' + condition + '` = ' + db.get().escape(conditions[condition]);
				if(condition != lastCondition) {
					query += ' AND ';
				}
			}
		}
		db.get().query(query, function(err,rows) {
			if(err) return done(err);
			done(null, rows);
		});
	};

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
		console.log(query);
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

	model.getById = function(id, raw, done) {
		db.get().query('SELECT * FROM `' + table + '` WHERE `id_' + table + '` = ' + db.escape(id), function(err, result) {
			if(err) return done(err);
			if(result.length < 1) {
				return done("No object found by that id");
			}
			var object = result[0];
			var asyncRequests = [];
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
		db.get().query("SELECT column_name, is_nullable, data_type, character_maximum_length  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'logement'", function(err, result) {
			if(err) return done(err);
			for (var i=0; i < result.length; i++) {
				if(result[i].column_name == 'id_' + table) {
					continue;
				} else if (result[i].column_name.substr(0, 3) == 'id_') {
					var key = result[i].column_name.substr(3);
				} else {
					var key = result[i].column_name;
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

