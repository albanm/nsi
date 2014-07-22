var nconf = require('nconf');
var express = require('express');
var bodyParser = require('body-parser');
var nsiRoutes = require('nsi-routes');
var nsiQueues = require('nsi-queues');

// Setup nconf to use in ordercommand-line arguments, environment variables, a file
nconf.argv().env().file('examples/http-exposition/config.json').load();

var routesHelper = nsiRoutes(nconf.get('nsi:routes-helper'));

nsiQueues('amqp', {}, function(err, queuesHelper) {
	if (err) return routesHelper.log('error', 'Failed to initialize NSI queues helper');

	// Prepare routes for communication of 'product' resources over AMQP and schema validation
	var saveProductRoute = routesHelper.to(queuesHelper, 'product.mediation.save');
	var getProductRoute = routesHelper.inOut(queuesHelper, 'product.mediation.get');
	var validateProductRoute = routesHelper.jsonSchema('examples/http-exposition/product-schema.json');

	// Prepare Express application for simple operations on 'product' resource in JSON format
	var app = express();
	app.use(bodyParser.json());

	// Create/update of resource over HTTP
	app.put('/product/:id', function(req, res, next) {
		validateProductRoute(req.body, function(err, product) {
			if (err) return res.json(400, err);
			saveProductRoute(product, function(err) {
				if (err) return next(err);
				res.json(202, req.body);
			});
		});
	});

	// Get of a resource over HTTP
	app.get('/product/:id', function(req, res, next) {
		getProductRoute(req.params.id, function(err, product) {
			if (err) return next(err);
			res.json(product);
		});
	});

	app.listen(nconf.get('nsi:http-exposition:port'), function(err) {
		routesHelper.log('info', 'HTTP exposition listening on port %d', nconf.get('nsi:http-exposition:port'));
	});
});