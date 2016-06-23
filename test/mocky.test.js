'use strict';

var expect = require('expect.js'),
	mocky = require('../'),
	http = require('http'),
	listen = {host: '127.0.0.1', port: 4321};

var recorderData = [{
	url: '/rectesturl1',
	method: 'get'
}, {
	url: '/rectesturl2',
	method: 'post',
	req: 'recorded POST test url #2'
}, {
	url: '/rectesturl3',
	method: 'put',
	req: 'recorded PUT test url #3'
}, {
	url: '/rectesturl4',
	method: 'delete'
}];

describe('Mocky', function() {
	describe('server', function() {
		it('start without errors', function() {
			mocky.createServer([{
				url: '/testurl1'
			}, {
				url: '/testurl2',
				res: 'testurl2 res'
			}, {
				url: '/testurl3',
				res: {
					status: 202,
					headers: {'Content-type': 'text/html'},
					body: 'testurl3 res'
				}
			}, {
				url: '/testurl4',
				res: function(req, res) {
					return 'testurl4 res';
				}
			}, {
				url: '/testurl5',
				res: function(req, res) {
					return {
						status: 202,
						headers: {'Content-type': 'text/html'},
						body: 'testurl5 res'
					};
				}
			}, {
				url: '/testurl6',
				res: function(req, res, callback) {
					setTimeout(function() {
						callback(null, 'testurl6 res');
					}, 200);
				}
			}, {
				url: '/testurl7',
				res: function(req, res, callback) {
					setTimeout(function() {
						callback(null, {
							status: 202,
							headers: {'Content-type': 'text/html'},
							body: 'testurl7 res'
						});
					}, 200);
				}
			}, {
				url: '/testurl8',
				method: 'post',
				req: 'testurl8 req'
			}, {
				url: '/testurl9',
				method: 'post',
				req: {body: 'testurl9 req'}
			}, {
				url: '/testurl10',
				method: 'post',
				req: function(req) {
					return 'testurl10 req';
				}
			}, {
				url: '/testurl11',
				method: 'post',
				req: function(req) {
					return {body: 'testurl11 req'};
				}
			}, {
				url: '/testurl12',
				method: 'post',
				req: {body: 'testurl12 req'},
				res: {
					status: 202,
					headers: {'Content-type': 'text/html'},
					body: 'testurl12 res'
				}
			}, {
				url: '/testurl13',
				method: 'put',
				req: {body: 'testurl13 req'},
				res: function(req, res) {
					return {body: '[' + req.body + ']'};
				}
			}, {
				url: /\/testurl14\?a=\d+/i,
				method: 'get',
				res: function(req, res) {
					return '[' + req.url + ']';
				}
			}, {
				url: '/testurl15',
				method: 'all',
				res: function(req, res) {
					return req.method + ' testurl15 res';
				}
			}, {
				url: '/testurl16',
				method: 'delete',
				req: {}
			}], {
				logLevel: 'none'
			}).listen(listen.port, listen.host);
		});

		it('GET /testurl1 without method, req, res', function(done) {
			request({
				path: '/testurl1'
			}, function(err, res) {
				expectResponseData(err, res, {body: ''}, done);
			});
		});

		it('GET /testurl2 with simple string res', function(done) {
			request({
				path: '/testurl2'
			}, function(err, res) {
				expectResponseData(err, res, {body: 'testurl2 res'}, done);
			});
		});

		it('GET /testurl3 with status, headers and body res', function(done) {
			request({
				path: '/testurl3'
			}, function(err, res) {
				expectResponseData(err, res, {
					body: 'testurl3 res',
					status: 202,
					headers: {'content-type': 'text/html'}
				}, done);
			});
		});

		it('GET /testurl4 with simple function res', function(done) {
			request({
				path: '/testurl4'
			}, function(err, res) {
				expectResponseData(err, res, {body: 'testurl4 res'}, done);
			});
		});

		it('GET /testurl5 with function res with status, headers and body', function(done) {
			request({
				path: '/testurl5'
			}, function(err, res) {
				expectResponseData(err, res, {
					body: 'testurl5 res',
					status: 202,
					headers: {'content-type': 'text/html'}
				}, done);
			});
		});

		it('GET /testurl6 with async simple function res', function(done) {
			request({
				path: '/testurl6'
			}, function(err, res) {
				expectResponseData(err, res, {body: 'testurl6 res'}, done);
			});
		});

		it('GET /testurl7 with async function res with status, headers and body', function(done) {
			request({
				path: '/testurl7'
			}, function(err, res) {
				expectResponseData(err, res, {
					body: 'testurl7 res',
					status: 202,
					headers: {'content-type': 'text/html'}
				}, done);
			});
		});

		it('POST /testurl8 with simple string req', function(done) {
			request({
				path: '/testurl8',
				method: 'post',
				body: 'testurl8 req'
			}, function(err, res) {
				expectResponseData(err, res, {body: ''}, done);
			});
		});

		it('POST /testurl9 with object req', function(done) {
			request({
				path: '/testurl9',
				method: 'post',
				body: 'testurl9 req'
			}, function(err, res) {
				expectResponseData(err, res, {body: ''}, done);
			});
		});

		it('POST /testurl10 with simple function req', function(done) {
			request({
				path: '/testurl10',
				method: 'post',
				body: 'testurl10 req'
			}, function(err, res) {
				expectResponseData(err, res, {body: ''}, done);
			});
		});

		it('POST /testurl11 with function req with object', function(done) {
			request({
				path: '/testurl11',
				method: 'post',
				body: 'testurl11 req'
			}, function(err, res) {
				expectResponseData(err, res, {body: ''}, done);
			});
		});

		it('POST /testurl12 with object req and res', function(done) {
			request({
				path: '/testurl12',
				method: 'post',
				body: 'testurl12 req'
			}, function(err, res) {
				expectResponseData(err, res, {
					body: 'testurl12 res',
					status: 202,
					headers: {'content-type': 'text/html'}
				}, done);
			});
		});

		it('PUT /testurl13 with object req and function res', function(done) {
			request({
				path: '/testurl13',
				method: 'put',
				body: 'testurl13 req'
			}, function(err, res) {
				expectResponseData(err, res, {body: '[testurl13 req]'}, done);
			});
		});

		it('GET /testurl14 with object req and function res', function(done) {
			request({
				path: '/testurl14?a=100500'
			}, function(err, res) {
				expectResponseData(err, res, {body: '[/testurl14?a=100500]'}, done);
			});
		});

		it('ALL (GET) /testurl15 without res', function(done) {
			request({
				path: '/testurl15',
				method: 'get'
			}, function(err, res) {
				expectResponseData(err, res, {body: 'GET testurl15 res'}, done);
			});
		});

		it('ALL (POST) /testurl15 without res', function(done) {
			request({
				path: '/testurl15',
				method: 'post'
			}, function(err, res) {
				expectResponseData(err, res, {body: 'POST testurl15 res'}, done);
			});
		});

		it('ALL (PUT) /testurl15 without res', function(done) {
			request({
				path: '/testurl15',
				method: 'put'
			}, function(err, res) {
				expectResponseData(err, res, {body: 'PUT testurl15 res'}, done);
			});
		});

		it('DELETE /testurl16 empty req', function(done) {
			request({
				path: '/testurl16',
				method: 'delete',
				req: ''
			}, function(err, res) {
				expectResponseData(err, res, {}, done);
			});
		});
	});

	describe('recorder', function() {
		it('.start()', function(done) {
			mocky.recorder.start({print: false});

			var counter = 0;

			recorderData.forEach(function(reqData) {
				request({
					path: reqData.url,
					method: reqData.method,
					body: reqData.req
				}, function(err, res) {
					if (++counter === 4) done();
				});
			});
		});

		it('.stop()', function() {
			mocky.recorder.stop();

			expect(mocky.recorder.outputs).to.eql(recorderData);
		});

		it('.crear()', function() {
			mocky.recorder.clear();
		});
	});
});

function expectResponseData(err, res, params, done) {
	if (err) done(err);

	params = params || {};
	params.status = params.status || 200;

	expect(res).to.have.key('statusCode');
	expect(res.statusCode).to.equal(params.status);

	if (typeof params.body !== 'undefined') {
		expect(res).to.have.key('body');
		expect(res.body).to.equal(params.body);
	}

	if (typeof params.headers !== 'undefined') {
		for (var key in params.headers) {
			key = key.toLowerCase();
			expect(res.headers).to.have.key(key);
			expect(res.headers[key]).to.equal(params.headers[key].toLowerCase());
		}
	}

	done();
}

function request(params, callback) {
	params.host = listen.host;
	params.port = listen.port;
	params.method = params.method || 'get';

	var req = http.request(params, function(res) {
		var resBody = '';

		res.on('data', function(chunk) {
			resBody += chunk;
		});

		res.on('end', function() {
			res.body = resBody;
			callback(null, res);
		});
	});

	req.on('error', function(err) {
		callback(err)
	});

	req.end(params.body ? params.body : null);
}
