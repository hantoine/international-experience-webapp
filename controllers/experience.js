var express = require('express');
var router = express.Router();

router.get('/:continent', function(req, res, next) {
	res.render('experience.ejs', {experiences: [
			{id_etudiant: 48, pays: 'Canada'},
			{id_etudiant: 47, pays: 'US'}
		]
	});
});

router.get('/show/:idExp')

module.exports = router;