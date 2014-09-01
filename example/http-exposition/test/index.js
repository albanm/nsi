var should = require('should');
var request = require('request');
var nsiQueues = require('nsi-queues');

var baseUrl = 'http://localhost:3010';

describe('NSI example - HTTP exposition - express application', function() {

	// Prepare to receive messages from the exposition server
	var queuesHelper;
	before(function(callback) {
		nsiQueues('amqp', {}, function(err, helper) {
			queuesHelper = helper;
			callback();
		});
	});
	var saveProductCallback;
	before(function(callback) {
		queuesHelper.from('product.mediation.save', callback, function(err, message, headers, ack) {
			if (saveProductCallback) saveProductCallback(err, message, headers);
			ack();
		});
	});
	var getProductCallback;
	before(function(callback) {
		queuesHelper.from('product.mediation.get', callback, function(err, message, headers, respond) {
			if (saveProductCallback) getProductCallback(err, message, headers, respond);
		});
	});

	it('should accept a PUT request and transmit it through AMQP', function(callback) {
		saveProductCallback = function(err, message, headers) {
			message.should.have.property('id', 1);
			setTimeout(callback(), 1000);
		};

		var product = {
			id: 1,
			name: 'book'
		};
		request.put({
			url: baseUrl + '/product/1',
			json: product
		}, function(err, response, body) {
			response.statusCode.should.equal(202);
		});
	});

	it('should reject an invalid PUT request', function(callback) {
		var product = {
			id: 1
		};
		request.put({
			url: baseUrl + '/product/1',
			json: product
		}, function(err, response, body) {
			response.statusCode.should.equal(400);
			callback();
		});
	});

	it('should accept a GET request and transmit it both ways through AMQP', function(callback) {
		getProductCallback = function(err, message, headers, respond) {
			message.should.equal('1');
			respond(null, {
				id: 1,
				name: 'computer'
			});
		};

		var product = {
			id: 1,
			name: 'book'
		};
		request.get({
			url: baseUrl + '/product/1',
			json: true
		}, function(err, response, body) {
			response.statusCode.should.equal(200);
			body.should.have.property('name', 'computer');
			callback();
		});
	});
});