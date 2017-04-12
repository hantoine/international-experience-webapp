var db = require('../db.js');
var form = require('./form.js');
db.connect(db.MODE_PRODUCTION, function() {
	form.getFormGroupList(function(err, result) {
		if(err) { 
			console.log (err);}
		else {
			console.log(result);
		}
	});
});
