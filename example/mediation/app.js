var nconf = require('nconf');
var express = require('express');
var bodyParser = require('body-parser');
var nsiRoutes = require('nsi-routes');
var nsiQueues = require('nsi-queues');

// Setup nconf to use in ordercommand-line arguments, environment variables, a file
nconf.argv().env().file('config.json').load();
var conf = nconf.get('nsiExample:mediation');

var routes = nsiRoutes(conf.routesHelper);

nsiQueues(conf.queuesHelper.type, conf.queuesHelper.options, function(err, queues) {
	queues.from('product.mediation.get', function(err, id, response) {})

	// Prepare Express application at least to make the process pingable
	var app = express();
	app.get('/', function(req, res, next) {
		res.send('Welcome to NSI example - Mediation');
	});
	app.listen(conf.mediation.port, function(err) {
		routes.log('info', 'Mediation listening on port %d', conf.mediation.port);
	});
});