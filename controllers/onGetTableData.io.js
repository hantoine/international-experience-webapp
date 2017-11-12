var genericModel = require('../models/generic.js');
var authorizedTables= ['experience_view'];
module.exports = function(socket) {

	return function(req) {
		if(req.table == "experience") req.table = "experience_view";
		if (!authorizedTables.includes(req.table)) {
			return;
		}
		if(!socket.request.session.adminLogged) {
			var newCols = req.cols.filter(function(col) {
				return !['firstname', 'lastname'].includes(col);
			});
			req.cols = newCols;
		}
		genericModel.get(req.table).getList(req.cols, req.conditions, null, req.groupby, req.sorted ? [req.sorted] : null, req.limit, function(err, results, nbRow) {
			if(err) return console.log(err);
			socket.emit('receiveTableData', {
				attributes: req.cols,
				table: results,
				nbRow: nbRow
			});
		});
	}
}
