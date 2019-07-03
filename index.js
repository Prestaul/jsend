var STATUSES = {
	success: { required: ['status', 'data'], allowed:['status', 'data'] },
	fail: { required: ['status', 'data'], allowed:['status', 'data'] },
	error: { required: ['status', 'message'], allowed:['status', 'message', 'data', 'code'] }
};

function requireKeys(keys, json) {
	return keys.every(function(key) {
		return key in json;
	});
}

function allowKeys(keys, json) {
	return Object.keys(json).every(function(key) {
		return ~keys.indexOf(key);
	});
}

function jsend(config, host) {
	config = config || {};
	host = host || {};

	function isValid(json) {
		var spec = STATUSES[json && json.status],
			valid = !!spec && requireKeys(spec.required, json);

		if(config.strict) valid = valid && allowKeys(spec.allowed, json);

		return valid;
	}

	function forward(json, done) {
		if(!isValid(json))
			json = {
				status: 'error',
				message: 'Invalid jsend object.',
				data: { originalObject: json }
			};

		if(json.status === 'success')
			done(null, json.data);
		else {
			var err = new Error(json.message || ('Jsend response status: ' + json.status));
			if('code' in json) err.code = json.code;
			if('data' in json) err.data = json.data;
			done(err, json.data);
		}
	}

	function fromArguments(err, json) {
		if(arguments.length === 1 && err.length === 2) {
			json = err[1];
			err = err[0];
		}

		if(err) {
			json = {
				status: 'error',
				message: (typeof err === 'string')
					? err
					: err && err.message || 'Unknown error. (jsend)'
			};
			if(err && err.stack) json.data = { stack:err.stack };
		} else if(json === undefined) {
			json = {
				status: 'error',
				message: 'No data returned.'
			};
		} else if(!isValid(json)) {
			json = {
				status: 'success',
				data: json
			};
		}

		return json;
	}

	function success(data) {
		if(data === undefined) throw new Error('"data" must be defined when calling jsend.success. (jsend)');
		return {
			status: 'success',
			data: (data && data.status === 'success' && isValid(data))
				? data.data
				: data
		};
	}

	function fail(data) {
		if(data === undefined) throw new Error('"data" must be defined when calling jsend.fail. (jsend)');
		return{
			status: 'fail',
			data: (data && data.status === 'fail' && isValid(data))
				? data.data
				: data
		};
	}

	function error(message, rest) {
		var json = {
			status: 'error'
		};

		if(typeof message === 'string') {
			json.message = message;
			if(rest) {
				if(rest.code !== undefined) json.code = rest.code;
				if(rest.data !== undefined) json.data = rest.data;
			}
		} else if(message && message.message) {
			json.message = message.message;
			if(message.code !== undefined) json.code = message.code;
			if(message.data !== undefined) json.data = message.data;
		} else {
			throw new Error('"message" must be defined when calling jsend.error. (jsend)');
		}

		return json;
	}

	host.isValid = isValid;
	host.forward = forward;
	host.fromArguments = fromArguments;
	host.success = success;
	host.fail = fail;
	host.error = error;

	host.middleware = function(req, res, next) {
		var middleware = res.jsend = function(err, json) {
			res.json(fromArguments(err, json));
		};

		middleware.success = function(data) {
			res.json(success(data));
		};
		middleware.fail = function(data) {
			res.json(fail(data));
		};
		middleware.error = function(message) {
			res.json(error(message));
		};

		next();
	};

	return host;
}

module.exports = jsend(null, jsend);
