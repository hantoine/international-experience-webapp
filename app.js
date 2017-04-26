var config = require('./config');
var express = require('express');
var morgan  = require('morgan'); // Utilisé pour les logs
var session = require('cookie-session');
var bodyParser = require('body-parser'); // Permettra de récupérer les données issues d'un formulaire
var ent = require('ent');
var db = require('./db');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Midlewares
app.use(express.static(__dirname + '/public')); // Fichiers statique (css, images, etc.)
app.use(session({secret: 'xDqgDkEIiRX9CVdHS3UhyZYtDD4ovK+W2VNIbPBWMJ0vwsSznNc/sA=='}))
app.use(morgan('combined')); // Logging

app.use(bodyParser.urlencoded({extended: false}));
app.use('/form', require('./controllers/form'));
app.use('/experience', require('./controllers/experience'));
app.use('/admin', require('./controllers/admin'));
app.use('/list', require('./controllers/list'));
app.use('/show', require('./controllers/show'));
app.use('/delete', require('./controllers/delete'));
app.use('/new', require('./controllers/new'));
app.use('/edit', require('./controllers/edit'));
app.get('/', require('./controllers/home'));

app.use(function(req, res, next){
	res.setHeader('Content-type', 'text/plain');
	res.status(404).send('Page introuvable !');
});

io.sockets.on('connection', function(socket) {
	socket.on('getData', require('./controllers/onGetData.io')(socket));
});

// Connect to MySQL on start
db.connect(config.databaseMode, function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.');
    process.exit(1);
  } else {
    server.listen(config.listeningPort, function() {
      console.log('Listening on port ' + config.listeningPort + '...');
    })
  }
})
