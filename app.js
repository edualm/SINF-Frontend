var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config/config');

var api = require('./api/api');
var index = require('./routes/index');
var login = require('./routes/login');
var users = require('./routes/users');
var user = require('./routes/user');
var items = require('./routes/items');
var customers = require('./routes/customers');
var routes = require('./routes/routes');
var sales = require('./routes/sales');
var invoices = require('./routes/invoices');
var warehouses = require('./routes/warehouses');
var picking = require('./routes/picking');
var inventory = require('./routes/inventory');

var app = express();

require('mongoose').connect(config.db.url);
if (config.seedData) {
  require('./config/seed');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/api', api);
app.use('/login', login);
app.use('/users', users);
app.use('/user', user);
app.use('/items', items);
app.use('/customers', customers);
app.use('/routes', routes);
app.use('/sales', sales);
app.use('/invoices', invoices);
app.use('/warehouses', warehouses);
app.use('/picking', picking);
app.use('/inventory', inventory);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
  if (err.status == 401) {
    res.redirect('/login');
  }
});

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
