var fs = require("fs");

var sqlite3 = require("sqlite3").verbose();
var file = __dirname + "/alumni.sqlite";
if (!fs.existsSync(file)) {
	console.log("DB has not been built. Please run 'node makedbfromcsv.js'");
	process.exit(1)
}
global.db = new sqlite3.Database(file);
global.hbs = require('hbs');

var express = require('express');
var sqlinjection = require('sql-injection');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

global.ssa = {};
try {
  global.ssa = require("../khk-ssa/khk-access/index.js")();
} catch(e) {
  console.log("Failed to contact khk-ssa, please clone it from the repo adjacent to this folder.");
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

global.hbs.registerPartials(__dirname + '/views/partials');
var helpers = require('./views/helpers')(global.hbs);




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(sqlinjection);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(ssa.navbar);

app.use('/', routes);
app.use('/users', users);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

app.listen(7000);
