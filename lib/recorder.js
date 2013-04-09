'use strict';

var http = require('http');
var https = require('https');
var oldRequest = http.request;
var oldHttpsRequest = https.request;
var inspect = require('util').inspect;

var cutBegin = '\n<<<<<<-- route begin -->>>>>>\n',
	cutEnd = '\n<<<<<<-- route end -->>>>>>\n';

var outputs = [];

function generateRequestAndResponse(body, options, res, datas) {
	var requestBody = body.map(function(buffer) {
		return buffer.toString('utf8');
	}).join('');

	var responseBody = datas.map(function(buffer) {
		return buffer.toString('utf8');
	}).join('');

	var ret = {
		url: options.path,
		method: options.method
	};
	if (requestBody) ret.req = requestBody;
	if (responseBody) ret.res = responseBody;
	return ret;
}

function record(params) {
	params = params || {};
	[http, https].forEach(function(module) {
		var oldRequest = module.request;
		module.request = function(options, callback) {
			var body = [], req, oldWrite, oldEnd;
			req = oldRequest.call(http, options, function(res) {
				var datas = [];
				res.on('data', function(data) {
					datas.push(data);
				});
				if (module === https) options._https_ = true;
				res.once('end', function() {
					var out = generateRequestAndResponse(
						body, options, res, datas
					);
					outputs.push(out);
					if (params.print) console.log(
						cutBegin + JSON.stringify(out, null, 4) + cutEnd
					);
				});
				if (callback) callback.apply(res, arguments);
			});
			oldWrite = req.write;
			req.write = function(data) {
				if ('undefined' !== typeof(data)) {
					if (data) {body.push(data); }
					oldWrite.call(req, data);
				}
			};
			return req;
		};

	});
}

function restore() {
	http.request = oldRequest;
	https.request = oldHttpsRequest;
}

function clear() {
	outputs = [];
}

exports.start = record;
exports.outputs = outputs;
exports.stop = restore;
exports.clear = clear;
