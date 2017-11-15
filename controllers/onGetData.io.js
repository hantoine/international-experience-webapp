var genericModel = require('../models/generic.js');
var authorizedTables= ['pays', 'ville', 'organisation'];
module.exports = function(socket) {

	return function(req) {
		if (!authorizedTables.includes(req.table)) {
			console.log('Error: requested table is not authorized');
			return;
		}
		genericModel.get(req.table).getList(['nom'], req.conditions, null, null, null, null, function(err, results) {
			if(err) return console.log(err);
			socket.emit('receiveData', {
				identifiant: 'id_'+req.table,
				options: results
			})
		});
	}
}
