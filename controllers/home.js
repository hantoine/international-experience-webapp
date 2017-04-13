var express = require('express');

module.exports = function(req, res, next) {
	res.render('home.ejs');
};
