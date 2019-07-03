var assert = require('chai').assert,
	jsend = require('../index');


describe('jsend', function() {

	function basicTests(jsendInstance) {

		describe('- isValid', function() {
			describe('should validate', function() {
				describe('"success" status', function() {
					it('with object data', function() {
						assert(jsendInstance.isValid({
							status: 'success',
							data: { foo:'bar' }
						}));
					});

					it('with array data', function() {
						assert(jsendInstance.isValid({
							status: 'success',
							data: [1, 2, 3]
						}));
					});

					it('with null data', function() {
						assert(jsendInstance.isValid({
							status: 'success',
							data: null
						}));
					});
				});

				describe('"fail" status', function() {
					it('with object data', function() {
						assert(jsendInstance.isValid({
							status: 'fail',
							data: { foo:'bar' }
						}));
					});

					it('with array data', function() {
						assert(jsendInstance.isValid({
							status: 'fail',
							data: [1, 2, 3]
						}));
					});

					it('with null data', function() {
						assert(jsendInstance.isValid({
							status: 'fail',
							data: null
						}));
					});
				});

				describe('"error" status', function() {
					it('with a message', function() {
						assert(jsendInstance.isValid({
							status: 'error',
							message: 'something is wrong'
						}));
					});

					it('with a message and a code', function() {
						assert(jsendInstance.isValid({
							status: 'error',
							message: 'something is wrong',
							code: 123
						}));
					});

					it('with a message and data', function() {
						assert(jsendInstance.isValid({
							status: 'error',
							message: 'something is wrong',
							data: { stack:'this -> that -> the other' }
						}));
					});

					it('with a message, a code, and data', function() {
						assert(jsendInstance.isValid({
							status: 'error',
							message: 'something is wrong',
							code: 123,
							data: { stack:'this -> that -> the other' }
						}));
					});
				});
			});

			describe('should invalidate', function() {
				it('object with no status', function() {
					assert.isFalse(jsendInstance.isValid({
						data: { foo:'bar' }
					}));
				});

				it('"success" status without data', function() {
					assert.isFalse(jsendInstance.isValid({
						status: 'success'
					}));
				});

				it('"fail" status without data', function() {
					assert.isFalse(jsendInstance.isValid({
						status: 'fail'
					}));
				});

				it('"error" status without message', function() {
					assert.isFalse(jsendInstance.isValid({
						status: 'error',
						data: { foo:'bar' }
					}));
				});
			});
		});



		describe('- fromArguments', function() {
			describe('should generate "success"', function() {
				it('with object data', function() {
					var json = { status:'success', data:{ foo:'bar' } };
					assert.deepEqual(jsendInstance.fromArguments(null, json.data), json);
				});

				it('with array data', function() {
					var json = { status:'success', data:[1,2,3] };
					assert.deepEqual(jsendInstance.fromArguments(null, json.data), json);
				});

				it('with string data', function() {
					var json = { status:'success', data:'you got it' };
					assert.deepEqual(jsendInstance.fromArguments(null, json.data), json);
				});

				it('with numeric data', function() {
					var json = { status:'success', data:123 };
					assert.deepEqual(jsendInstance.fromArguments(null, json.data), json);
				});

				it('with null data', function() {
					var json = { status:'success', data:null };
					assert.deepEqual(jsendInstance.fromArguments(null, json.data), json);
				});
			});

			describe('should generate "error"', function() {
				it('with error message as first arg', function() {
					var json = { status:'error', message:'something bad' };
					assert.deepEqual(jsendInstance.fromArguments(json.message), json);
				});

				it('with Error object as first arg', function() {
					var json = { status:'error', message:'something bad' },
						output = jsendInstance.fromArguments(new Error(json.message));
					assert.isObject(output.data);
					assert.isString(output.data.stack);
					delete output.data;
					assert.deepEqual(output, json);
				});

				it('with jsend error object as first arg', function() {
					var json = { status:'error', message:'something bad' };
					assert.deepEqual(jsendInstance.fromArguments(json), json);
				});

				it('with jsend fail object as first arg', function() {
					var json = { status:'fail', data:{ something:'bad' } };
					assert.deepEqual(jsendInstance.fromArguments(json), { status:'error', message:'Unknown error. (jsend)' });
				});

				it('with jsend fail object as first arg and preserve message', function() {
					var json = { status:'fail', data:{ something:'bad' }, message:'Really bad!' };
					assert.deepEqual(jsendInstance.fromArguments(json), { status:'error', message:'Really bad!' });
				});

				it('with jsend success object as first arg', function() {
					var json = { status:'success', data:{ something:'bad' } };
					assert.deepEqual(jsendInstance.fromArguments(json), { status:'error', message:'Unknown error. (jsend)' });
				});
			});
		});



		describe('- forward', function() {
			function assertCall(expectedErr, expectedData) {
				return function(err, data) {
					if(expectedErr) {
						assert.typeOf(err, 'error');
						assert.isString(err.message);
						if(expectedErr.message) assert.equal(err.message, expectedErr.message);
						if(expectedErr.code) assert.equal(err.code, expectedErr.code);
					}

					if(expectedData !== undefined) {
						assert.deepEqual(data, expectedData);
					}
				};
			}

			describe('for "success"', function() {
				it('should pass object data', function() {
					var json = { status:'success', data:{ foo:'bar' } };
					jsendInstance.forward(json, assertCall(null, json.data));
				});

				it('should pass array data', function() {
					var json = { status:'success', data:[1,2,3] };
					jsendInstance.forward(json, assertCall(null, json.data));
				});

				it('should pass string data', function() {
					var json = { status:'success', data:'you got it' };
					jsendInstance.forward(json, assertCall(null, json.data));
				});

				it('should pass numeric data', function() {
					var json = { status:'success', data:123 };
					jsendInstance.forward(json, assertCall(null, json.data));
				});

				it('should pass null data', function() {
					var json = { status:'success', data:null };
					jsendInstance.forward(json, assertCall(null, json.data));
				});
			});

			describe('for "fail"', function() {
				it('should pass an error and data', function() {
					var json = { status:'fail', data:{ validation:false } };
					jsendInstance.forward(json, assertCall(true, json.data));
				});
			});

			describe('for "error"', function() {
				it('should pass an error', function() {
					var json = { status:'error', message:'something bad' };
					jsendInstance.forward(json, assertCall(json));
				});

				it('with code should pass an error with code', function() {
					var json = { status:'error', message:'something bad', code:123 };
					jsendInstance.forward(json, assertCall(json));
				});

				it('with data should pass the data', function() {
					var json = { status:'error', message:'something bad', code:123, data:{ foo:'bar' } };
					jsendInstance.forward(json, assertCall(json, json.data));
				});
			});

			describe('for invalid jsend responses', function() {
				it('passes string responses back as the error message', function() {
					var html = '<html><body>414 Request-URI Too Large</body></html>';
					jsendInstance.forward(html, function(err, data) {
						assert.equal(err.data.originalObject, html);
					});
				});

				it('passes object responses back as the error message', function() {
					var html = {"invalid-jsend": true};
					jsendInstance.forward(html, function(err, data) {
						assert.equal(err.data.originalObject["invalid-jsend"], html["invalid-jsend"]);
					});
				});
			});
		});

		describe('- success', function() {

			it('with jsend object', function() {
				var json = { status:'success', data:{ foo:'bar' } };

				assert.deepEqual(json, jsendInstance.success(json));
			});

			it('with object data', function() {
				var json = { status:'success', data:{ foo:'bar' } };

				assert.deepEqual(json, jsendInstance.success(json.data));
			});

			it('with array data', function() {
				var json = { status:'success', data:[1,2,3] };

				assert.deepEqual(json, jsendInstance.success(json.data));
			});

			it('with string data', function() {
				var json = { status:'success', data:'you got it' };

				assert.deepEqual(json, jsendInstance.success(json.data));
			});

			it('with numeric data', function() {
				var json = { status:'success', data:123 };

				assert.deepEqual(json, jsendInstance.success(json.data));
			});

			it('with null data', function() {
				var json = { status:'success', data:null };

				assert.deepEqual(json, jsendInstance.success(json.data));
			});

			it('should throw error with no data', function() {
				assert.throws(jsendInstance.success);
			});
		});

		describe('- fail', function() {

			it('with jsend object', function() {
				var json = { status:'fail', data:{ foo:'bar' } };

				assert.deepEqual(json, jsendInstance.fail(json));
			});

			it('with object data', function() {
				var json = { status:'fail', data:{ foo:'bar' } };

				assert.deepEqual(json, jsendInstance.fail(json.data));
			});

			it('with array data', function() {
				var json = { status:'fail', data:[1,2,3] };

				assert.deepEqual(json, jsendInstance.fail(json.data));
			});

			it('with string data', function() {
				var json = { status:'fail', data:'you got it' };

				assert.deepEqual(json, jsendInstance.fail(json.data));
			});

			it('with numeric data', function() {
				var json = { status:'fail', data:123 };

				assert.deepEqual(json, jsendInstance.fail(json.data));
			});

			it('with null data', function() {
				var json = { status:'fail', data:null };

				assert.deepEqual(json, jsendInstance.fail(json.data));
			});

			it('should throw error with no data', function() {
				assert.throws(jsendInstance.fail);
			});

		});

		describe('- error', function() {

			it('with message', function() {
				var json = { status:'error', message:'something bad' };

				assert.deepEqual(json, jsendInstance.error(json.message));
			});

			it('with message and code', function() {
				var json = { status:'error', message:'something bad', code:'BAD_THINGS' };

				assert.deepEqual(json, jsendInstance.error(json));
			});

			it('with message and data', function() {
				var json = { status:'error', message:'something bad', data:{ foo:'bar' } };

				assert.deepEqual(json, jsendInstance.error(json));
			});

			it('with message and data and code', function() {
				var json = { status:'error', message:'something bad', code:'BAD_THINGS', data:{ foo:'bar' } };

				assert.deepEqual(json, jsendInstance.error(json));
			});

			it('with message as first argument, and data and code as second', function () {
				var json = { status:'error', message:'something bad', code:'BAD_THINGS', data:{ foo:'bar' } };
				var { message, ...rest } = json;

				assert.deepEqual(json, jsendInstance.error(message, rest));
			});

			it('with message as first argument, and null as second', function () {
				var json = { status:'error', message:'something bad' };

				assert.deepEqual(json, jsendInstance.error(json.message, null));
			});

			it('should throw error with no message', function() {
				var json = { status:'error', code:'BAD_THINGS', data:{ foo:'bar' } };

				assert.throws(jsendInstance.error.bind(jsendInstance, json));
			});

		});

		describe('- middleware', function() {
			var req = {};

			it('should call "next" callback', function(done) {
				jsendInstance.middleware({}, {}, done);
			});

			describe('should respond with "error"', function() {
				it('with error message as first arg', function(done) {
					var json = { status:'error', message:'something bad' },
						res = {
							json: function(output) {
								assert.deepEqual(output, { status:'error', message:'something bad' });
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(json.message);
					});
				});

				it('with Error object as first arg', function(done) {
					var json = { status:'error', message:'something bad' },
						res = {
							json: function(output) {
								assert.isObject(output.data);
								assert.isString(output.data.stack);
								delete output.data;
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(new Error(json.message));
					});
				});

				it('with jsend error object as first arg', function(done) {
					var json = { status:'error', message:'something bad' },
						res = {
							json: function(output) {
								assert.deepEqual(jsendInstance.fromArguments(json), json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(json);
					});
				});

				it('with jsend fail object as first arg', function(done) {
					var json = { status:'fail', data:{ something:'bad' } },
						res = {
							json: function(output) {
								assert.deepEqual(jsendInstance.fromArguments(json), { status:'error', message:'Unknown error. (jsend)' });
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(json);
					});
				});

				it('with jsend fail object as first arg and preserve message', function(done) {
					var json = { status:'fail', data:{ something:'bad' }, message:'Really bad!' },
						res = {
							json: function(output) {
								assert.deepEqual(jsendInstance.fromArguments(json), { status:'error', message:'Really bad!' });
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(json);
					});
				});

				it('with jsend success object as first arg', function(done) {
					var json = { status:'success', data:{ something:'bad' } },
						res = {
							json: function(output) {
								assert.deepEqual(jsendInstance.fromArguments(json), { status:'error', message:'Unknown error. (jsend)' });
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(json);
					});
				});

			});

			describe('should respond with "success"', function() {

				it('with jsend object', function(done) {
					var json = { status:'success', data:{ foo:'bar' } },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(null, json);
					});
				});

				it('with object data', function(done) {
					var json = { status:'success', data:{ foo:'bar' } },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(null, json.data);
					});
				});

				it('with array data', function(done) {
					var json = { status:'success', data:[1,2,3] },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(null, json.data);
					});
				});

				it('with string data', function(done) {
					var json = { status:'success', data:'you got it' },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(null, json.data);
					});
				});

				it('with numeric data', function(done) {
					var json = { status:'success', data:123 },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(null, json.data);
					});
				});

				it('with null data', function(done) {
					var json = { status:'success', data:null },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend(null, json.data);
					});
				});

			});

			describe('.success method', function() {

				it('with jsend object', function(done) {
					var json = { status:'success', data:{ foo:'bar' } },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.success(json);
					});
				});

				it('with object data', function(done) {
					var json = { status:'success', data:{ foo:'bar' } },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.success(json.data);
					});
				});

				it('with array data', function(done) {
					var json = { status:'success', data:[1,2,3] },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.success(json.data);
					});
				});

				it('with string data', function(done) {
					var json = { status:'success', data:'you got it' },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.success(json.data);
					});
				});

				it('with numeric data', function(done) {
					var json = { status:'success', data:123 },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.success(json.data);
					});
				});

				it('with null data', function(done) {
					var json = { status:'success', data:null },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.success(json.data);
					});
				});

				it('should throw error with no data', function(done) {
					var res = {};
					jsendInstance.middleware(req, res, function() {
						assert.throws(function() {
							res.jsend.success();
						});
						done();
					});
				});

			});

			describe('.fail method', function() {

				it('with jsend object', function(done) {
					var json = { status:'fail', data:{ foo:'bar' } },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.fail(json);
					});
				});

				it('with object data', function(done) {
					var json = { status:'fail', data:{ foo:'bar' } },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.fail(json.data);
					});
				});

				it('with array data', function(done) {
					var json = { status:'fail', data:[1,2,3] },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.fail(json.data);
					});
				});

				it('with string data', function(done) {
					var json = { status:'fail', data:'you got it' },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.fail(json.data);
					});
				});

				it('with numeric data', function(done) {
					var json = { status:'fail', data:123 },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.fail(json.data);
					});
				});

				it('with null data', function(done) {
					var json = { status:'fail', data:null },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.fail(json.data);
					});
				});

				it('should throw error with no data', function(done) {
					var res = {};
					jsendInstance.middleware(req, res, function() {
						assert.throws(function() {
							res.jsend.fail();
						});
						done();
					});
				});

			});

			describe('.error method', function() {

				it('with message', function(done) {
					var json = { status:'error', message:'something bad' },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.error(json.message);
					});
				});

				it('with message and code', function(done) {
					var json = { status:'error', message:'something bad', code:'BAD_THINGS' },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.error(json);
					});
				});

				it('with message and data', function(done) {
					var json = { status:'error', message:'something bad', data:{ foo:'bar' } },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.error(json);
					});
				});

				it('with message and data and code', function(done) {
					var json = { status:'error', message:'something bad', code:'BAD_THINGS', data:{ foo:'bar' } },
						res = {
							json: function(output) {
								assert.deepEqual(output, json);
								done();
							}
						};
					jsendInstance.middleware(req, res, function() {
						res.jsend.error(json);
					});
				});

				it('should throw error with no message', function(done) {
					var json = { status:'error', code:'BAD_THINGS', data:{ foo:'bar' } },
						res = {};
					jsendInstance.middleware(req, res, function() {
						assert.throws(function() {
							res.jsend.error(json);
						});
						done();
					});
				});

			});
		});
	}

	describe('without strict flag', function() {
		var jsendInstance = jsend;

		basicTests(jsendInstance);
	});

	describe('with strict flag', function() {
		var jsendInstance = jsend({ strict:true });

		basicTests(jsendInstance);
	});

});
