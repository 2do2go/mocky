'use strict';

var expect = require('expect.js'),
	mocker = require('../'),
	http = require('http'),
	listen = {host: '127.0.0.1', port: 4321};


describe('mocker', function() {
	var firstRoute
	it('start without errors', function() {
		mocker.createServer({
			routes: [{
				url: '/someurl?a=b&c=d',
				method: 'POST',
				req: 'POST request body to match',
				res: 'response to return to client'
			}, {
				url: '/someurl?a=b&c=d',
				method: 'GET',
				res: 'response for GET request'
			}, {
				url: '/someurl?a=b&c=d',
				method: 'PUT',
				req: 'PUT request body to match',
				res: function(req, reqBody) {
					return '[ ' + reqBody + ' ]';
				}
			}],
			logLevel: 'none'
		}).listen(listen.port, listen.host);
	});

	it('respond on POST', function(done) {
		request({
			path: '/someurl?a=b&c=d',
			method: 'POST',
			data: 'POST request body to match'
		}, function(err, res) {
			expectResponseData(err, res, 'response to return to client', done);
		});
	});

	it('respond on GET', function(done) {
		request({
			path: '/someurl?a=b&c=d',
			method: 'GET'
		}, function(err, res) {
			expectResponseData(err, res, 'response for GET request', done);
		});
	});

	it('respond on PUT', function(done) {
		request({
			path: '/someurl?a=b&c=d',
			method: 'PUT',
			data: 'PUT request body to match'
		}, function(err, res) {
			expectResponseData(err, res, '[ PUT request body to match ]', done);
		});
	});
});

function expectResponseData(err, res, data, done) {
	if (err) done(err);
	expect(res).have.key('data');
	expect(res.data).equal(data);
	done();
}

function request(params, callback) {
	params.host = listen.host;
	params.port = listen.port;
	var req = http.request(params, function(res) {
		var data = '';
		res.on('data', function(chunk) { data += chunk; });
		res.on('end', function() {
			callback(null, {res: res, data: data});
		});
	});
	req.on('error', function(err) { callback(err) })
	req.end(params.data ? params.data : null);
}
