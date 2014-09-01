var nconf = require('nconf');
var express = require('express');
var bodyParser = require('body-parser');
var nsiRoutes = require('nsi-routes');
var nsiQueues = require('nsi-queues');

// Setup nconf to use in ordercommand-line arguments, environment variables, a file
nconf.argv().env().file('config.json').load();
var conf = nconf.get('nsiExample:httpExposition');

var routes = nsiRoutes(conf.routesHelper);

nsiQueues(conf.queuesHelper.type, conf.queuesHelper.options, function(err, queues) {
	if (err) return routes.log('error', 'Failed to initialize NSI queues helper');

	// Prepare routes for communication of 'product' resources over AMQP and schema validation
	var saveProductRoute = routes.to(queues, 'product.mediation.save');
	var getProductRoute = routes.inOut(queues, 'product.mediation.get');
	var validateProductRoute = routes.jsonSchema('examples/http-exposition/product-schema.json');

	// Prepare Express application for simple operations on 'product' resource in JSON format
	var app = express();
	app.use(bodyParser.json());

	// Make it at least accessible at its root
	app.get('/http-exposition', function(req, res, next){
		res.send('Welcome to NSI example - HTTP exposition');
	});

	app.get('/', function(req, res, next){
		res.send('Welcome to NSI example - ROOT');
	});

	// Create/update a resource over HTTP
	app.put('/product/:id', function(req, res, next) {
		validateProductRoute(req.body, function(err, product) {
			if (err) return res.json(400, err);
			saveProductRoute(product, function(err) {
				if (err) return next(err);
				res.json(202, req.body);
			});
		});
	});

	// Get a resource over HTTP
	app.get('/product/:id', function(req, res, next) {
		getProductRoute(req.params.id, function(err, product) {
			if (err) return next(err);
			res.json(product);
		});
	});

	app.listen(conf.port, function(err) {
		routes.log('info', 'HTTP exposition listening on port %d', conf.port);
	});
});