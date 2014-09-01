Node.js Services Integration
============================

*Use node.js as an integration environment.*

This project is not a framework or even a big library. It focuses on putting together the best node.js projects useful for integration of services purposes. Occasionaly we may provide small modules that help filling some gaps but mostly this is about recipes.

What we will strive to obtain:
  * Easy boostrapping of node.js services and exchange routes.
  * Examples served as small independant proof of concept projects for lots of usual scenarios.
  * Learn from experience and improve recipes in time to help create more robust and performant solutions.
  * Improve productivity by publishing small independant helper modules or contributing to external projects.

Sub-projects
------------

  * [NSI - Routes commons](https://github.com/albanm/nsi-queues): Enforce some conventions, provide wrapper for profiling and tracing, plus some pre-packaged routes for usual needs.
  * [NSI - Queues helpers](https://github.com/albanm/nsi-queues): Makes it easier to communicate through message queues.

Example
-------

An example can be found in this repository in the [example directory](./example).
It is a continuing work in progress constitued of linked [docker](https://www.docker.com/) images containing NSI routes, mock services, monitoring, broker, etc.

Asynchronous function convention for routes
-------------------------------------------

This is a *route*:

```js
var myRoute = function(message, headers, callback) {
   	// do some work here
   	callback(err, responseMessage, responseHeaders);
};
```

Respecting this convention will allow you to use our [routes helpers' wrapper](https://github.com/albanm/nsi-routes):

```js
var wrappedRoute = routesHelper.wrap(myRoute, 'My route');
```

Exchange messages over AMQP or STOMP
------------------------------------

Use [NSI - Queues helpers](https://github.com/albanm/nsi-queues):

```js
queuesHelper.to('my-queue', 'my message', {header1: 'header1'}, function(err, body, headers) {
	if (err) console.log('Message sending failed.');
	else console.log('Message was sent and acknowledged !');
});

queuesHelper.inOut('my-queue', 'my message', {header1: 'header1'}, function(err, body, headers) {
	if (err) console.log('Message sending failed.');
	else console.log('Response received: ' + body);
});

queuesHelper.from('my-queue', function(err, body, headers, responseCallback) {
	// do something with message and prepare response
	responseCallback(null, responseBody, responseHeaders);
});
```

Or use the same helpers pre-wrapped by a route helper:

```js
var saveProductRoute = routesHelper.to(queuesHelper, 'product.mediation.save');
saveProductRoute(product, function(err) {
  if (err) console.log('Message sending failed.');
  else console.log('Message was sent and acknowledged !');
});
```

For more advanced usage you can look directly at [node-amqp](https://github.com/postwait/node-amqp) and [stomp-js](https://github.com/benjaminws/stomp-js).

Expose Rest or plain HTTP services
----------------------------------

Simply use [express](http://expressjs.com/):

```js
// Prepare routes for communication of 'product' resources over AMQP and schema validation
var saveProductRoute = routesHelper.to(queuesHelper, 'product.mediation.save');
var validateProductRoute = routesHelper.jsonSchema('examples/http-exposition/product-schema.json');

// Prepare Express application for simple operations on 'product' resource in JSON format
var app = express();
app.use(bodyParser.json());

// Create/update of a product over HTTP, transmit to a AMQP queue if content is valid.
app.put('/product/:id', function(req, res, next) {
  validateProductRoute(req.body, function(err, product) {
    if (err) return res.json(400, err);
    saveProductRoute(product, function(err) {
      if (err) return next(err);
      res.json(202, req.body);
    });
  });
});
```

Expose Soap services
--------------------

*TODO*

Expose Web sockets services
---------------------------

*TODO*

Consume Rest or plain HTTP services
-----------------------------------

*TODO*

Consume Soap services
---------------------

*TODO*

Send emails over SMTP
---------------------

*TODO*

Monitor your technical routes
-----------------------------

*TODO*

Monitor your business activity
------------------------------

*TODO*

About configuration
-------------------

*TODO*

About robustness
----------------

*TODO*

