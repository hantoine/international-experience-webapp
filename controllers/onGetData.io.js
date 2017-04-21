var genericModel = require('../models/generic.js');
var authorizedTables= ['pays', 'ville', 'ecole'];
module.exports = function(socket) {

	return function(req) {
		if (! req.table in authorizedTables) {
			return;
		}
		genericModel(req.table).getList(null, function(err, results) {
			if(err) return console.log(err);
			socket.emit('receiveData', {
				identifiant: 'id_'+req.table,
				options: results
			})
		});
	}
}
