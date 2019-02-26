# jsend

Utilities and middleware to assist with sending and handling [jsend](https://github.com/omniti-labs/jsend) responses.


### Installation

```bash
npm install -S jsend
```



## Response Creation

Responses can be created using the `success`, `fail`, and `error` methods:

```js
// You can pass data or a jsend response to success
jsend.success({ foo: 'bar' }); // { status: 'success', data: { foo: 'bar' } }
jsend.success([ 'foo', 'bar' ]); // { status: 'success', data: [ 'foo', 'bar' ] }
jsend.success(1337); // { status: 'success', data: 1337 }
jsend.success(false); // { status: 'success', data: false }

// You can pass data or a jsend response to fail
jsend.fail({ itsa: 'trap' }); // { status: 'fail', data: { itsa: 'trap' } }
jsend.fail(true); // { status: 'fail', data: true }

// You can pass a message or an object with a message and optionally data and code
jsend.error('No soup for you!'); // { status: 'error', message: 'No soup for you!' }
jsend.error({
	code: 123,
    message: 'No soup for you!'
}); // { status: 'error', code: 123, message: 'No soup for you!' }
jsend.error({
	code: 123,
    message: 'No soup for you!',
    data: false
}); // { status: 'error', code: 123, message: 'No soup for you!', data: false }
```


### Node-style Callbacks 

The `fromArguments` method can be used to create jsend responses from node-style (i.e. `(err, data)`) callback arguments:

```js
getData(id, function(err, data) {
	var response = jsend.fromArguments(err, data);
});
```


### Http Middleware

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


### Responding with jsend sans-middleware

If you don't want to use the middleware you can simply create jsend responses and send them with `res.json`:

```js
getData(id, function(err, data) {
	res.json(jsend.fromArguments(err, data));
});
```



## Response Validation

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


### Response Forwarding

You can forward a jsend response to a node style callback using the `forward` method.

```js
jsend.forward(json, function(err, data) {
	// err will be set if status was 'error' or 'fail'
	// data will be set to the "data" property in all cases
});
```
