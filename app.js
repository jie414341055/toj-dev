/**
 * Author: jie414341055@gmail.com
 * 2014-04-27
 * Module dependencies
 */

var express = require('express');
var routes = require('./routes');
var config = require('./config');
var MongoStore = require('connect-mongo')(express);
var User = require('./controllers/user');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'html');
	app.register('.html', require('ejs'));
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: config.session_secret,
		store: new MongoStore({
			db: config.db_name,
		}),
	}));
	app.use(User.auth_user);
	//app.use(express.router(routes));
	routes(app);
	app.use(express.static(__dirname + '/public'));
	// Handle 404
	app.use(function(req, res) {
		res.status(404);
		res.render('404.html', {title: '404: Not Found'});
	});
	// Handle 500
	app.use(function(error, req, res, next) {
		res.status(500);
		res.render('500.html', {title: '500: Internal Server Error', error: error});
	});
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

app.dynamicHelpers({
	user: function(req, res) {
		return req.session.user;
	},
	oj: function(req, res) {
		return req.session.oj;
	},
	error: function(req, res) {
		var err = req.flash('error');
		if (err.length)
			return err;
		else
			return null;
	},
	success: function(req, res) {
		var succ = req.flash('success');
		if (succ.length)
			return succ;
		else
			return null;
	},
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
