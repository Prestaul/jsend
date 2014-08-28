jsend
===========

Utilities to assist with sending and handling jsend responses.

@TODO: document `forward` and `fromArguments` methods

@TODO: middleware


Response validation
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

// Returns false
jsend.isValid({
	status: 'success',
	data: { foo:'bar' },
	junk: 'is ok'
});
```


Creating a jsend response
-------------------------
```js
getData(id, function(err, data) {
	res.json(jsend.fromArguments(err, data));
});
```


Forwarding jsend responses to node-style callbacks
--------------------------------------------------
```js
jsend.forward(json, function(err, data) {

});
```


Http middleware
---------------
```js
expressApp.use(jsend.middleware);

expressApp.get('/', function(req, res) {
	loadData(req.params.someParam, function(err, data) {
		res.jsend(err, data);
	});
});
```

same as:
```js
expressApp.use(jsend.middleware);

expressApp.get('/', function(req, res) {
	loadData(req.params.someParam, res.jsend);
});
```

same but adds param validation:
```js
expressApp.use(jsend.middleware);

expressApp.get('/', function(req, res) {
	if(!req.params.someParam)
		return res.jsend.fail({ validation:['someParam is required'] });

	loadData(req.params.someParam, res.jsend);
});
```

same:
```js
expressApp.use(jsend.middleware);

expressApp.get('/', function(req, res) {
	if(!req.params.someParam)
		return res.jsend.fail({ validation:['someParam is required'] });

	loadData(req.params.someParam, function(err, data) {
		if(err) return res.error(err);
		res.jsend.success(data);
	});
});
```
