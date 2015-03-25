jsend
===========

Utilities to assist with sending and handling jsend responses.


Installation
------------
```bash
npm install -S jsend
```


Response Validation
-------------------
By default `jsend.isValid` validates that all required properties exist.
```js
var jsend = require('jsend');

// Returns true
jsend.isValid({
	status: 'success',
	data: { foo:'bar' }
});

// Returns false
jsend.isValid({
	status: 'success'
});

// Returns true
jsend.isValid({
	status: 'success',
	data: { foo:'bar' },
	junk: 'is ok'
});
```

Using the `strict` flag causes `jsend.isValid` to also validate that extraneous properties do not exist.
```js
var jsend = require('jsend')({ strict:true });

// Returns true
jsend.isValid({
	status: 'success',
	data: { foo:'bar' }
});

// Returns false
jsend.isValid({
	status: 'success'
});

// Returns false
jsend.isValid({
	status: 'success',
	data: { foo:'bar' },
	junk: 'is ok'
});
```


Response Forwarding
-------------------
You can forward a jsend response to a node style callback using the `forward` method.
```js
jsend.forward(json, function(err, data) {
	// err will be set if status was 'error' or 'fail'
	// data will be set to the "data" property in all cases
});
```


Http Middleware
---------------
The jsend middleware has methods for easily sending "succeess", "fail" and "error" responses:
```js
expressApp.use(jsend.middleware);

expressApp.get('/', function(req, res) {
	if(!req.params.someParam)
		return res.jsend.fail({ validation:['someParam is required'] });

	loadData(req.params.someParam, function(err, data) {
		if(err) return res.jsend.error(err);
		res.jsend.success(data);
	});
});
```

Or you can use `res.jsend` as a callback to respond automatically with a jsend wrapped response:
```js
expressApp.use(jsend.middleware);

expressApp.get('/', function(req, res) {
	loadData(req.params.someParam, res.jsend);
});
```

same as:
```js
expressApp.use(jsend.middleware);

expressApp.get('/', function(req, res) {
	loadData(req.params.someParam, function(err, data) {
		res.jsend(err, data);
	});
});
```


Creating a jsend response without middleware
--------------------------------------------
```js
getData(id, function(err, data) {
	res.json(jsend.fromArguments(err, data));
});
```
