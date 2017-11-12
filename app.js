var config = require('./config');
var express = require('express');
var morgan  = require('morgan'); // Utilisé pour les logs
var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); // Permettra de récupérer les données issues d'un formulaire
var ent = require('ent');
var db = require('./db');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var question = require('./models/question');

var sessionMiddleware = session({secret: 'xDqgDkEIiRX9CVdHS3UhyZYtDD4ovK+W2VNIbPBWMJ0vwsSznNc/sA=='});

// Setting up webserver midlleware and router
app.use(express.static(__dirname + '/public')); // Fichiers statique (css, images, etc.)
app.use(sessionMiddleware);
app.use(morgan('combined')); // Logging

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/form', require('./controllers/form'));
app.use('/admin', require('./controllers/admin'));
app.use('/list', require('./controllers/list'));
app.use('/show', require('./controllers/show'));
app.use('/delete', require('./controllers/delete'));
app.use('/new', require('./controllers/new'));
app.use('/edit', require('./controllers/edit'));
app.use('/util', require('./controllers/util'));
app.get('/', require('./controllers/home'));

app.use(function(req, res, next){
	res.setHeader('Content-type', 'text/plain');
	res.status(404).send('Page introuvable !');
});

// Setting up socket.io communication
io.sockets.use(function(socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
});

io.sockets.on('connection', function(socket) {
	socket.on('getData', require('./controllers/onGetData.io')(socket));
	socket.on('getTableData', require('./controllers/onGetTableData.io')(socket));
});

// Connect to database
db.connect(function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.');
    process.exit(1);
  } else {
    // update experience view using questions
    question.updateExperienceView(function(err) {
	    if(err) {
	    	console.log(err);
	    	db.close();
	    	return;
	    }
	    //start webserver
	    server.listen(config.listeningPort, function() {
	      console.log('Listening on port ' + config.listeningPort + '...');
	    })
    });
  }
})
