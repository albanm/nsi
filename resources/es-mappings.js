var request = require('request');
var async = require('async');

console.log('Initialize ElasticSearch index for NSI routes monitoring');

async.series([
	function(callback) {
		request.del('http://localhost:9200/nsi-routes', callback);
	},
	function(callback) {
		request.put({
			url: 'http://localhost:9200/nsi-routes',
			json: {
				"mappings": {
					"log": {
						"properties": {
							"@fields": {
								"properties": {
									"route": {
										"type": "string",
										"index": "not_analyzed"
									}
								}

							}
						}
					}
				}
			}
		}, callback);
	}
], function(err){
	if (err) console.log('Error while initializing ES %j', err);
	else console.log('Ok!');
});