'use strict';

var util = require('util');
var helpers = require('./helpers');

/**
 * Simple mock server
 */

module.exports.createServer = function(routes, params) {
	var logLevels = {'debug': 1, 'info': 2, 'none': 3};
	var params = params || {},
		srvType = params.srvType || 'http',
		srvOpts = params.srvOpts || {},
		logLevel = logLevelToInt(params.logLevel || 'info'),
		reqSeq = 0;

	helpers.each(routes, function(route) {
		route.method = route.method || 'get';

		if (route.req) {
			route.req = normalizeReqRes(route.req);
		}

		route.res = normalizeReqRes(route.res || {});
	});

	function normalizeReqRes(obj) {
		if (helpers.isFunction(obj)) {
			return obj;
		}

		if (helpers.isString(obj)) {
			obj = {body: obj};
		}

		if (helpers.isObject(obj)) {
			obj.status = obj.status || 200;
			obj.headers = obj.headers || {};
		}

		return obj;
	}

	return require(srvType).createServer(function(req, res) {
		var reqId = reqSeq++;
		var reqBody = '';

		req.on('data', function(chunk) {
			reqBody += chunk;
		}).on('end', function() {
			req.body = reqBody;

			log(
				'[' + new Date().toGMTString() + '] method: ' +
				req.method + ' url: ' + req.url + ' req.body: ' + reqBody
			);

			var matched = routes.filter(getReqMatcher(req));
			if (matched.length) {
				if (params.useFirstRoute || matched.length === 1) {
					var routeRes = matched[0].res;

					if (helpers.isFunction(routeRes)) {
						// if route res is function
						if (routeRes.length >= 3) {
							// async route res processing
							routeRes(req, res, function(err, obj) {
								if (err) {
									res.writeHead(500);
									res.end();
								} else {
									routeRes = normalizeReqRes(obj);
									sendRes(res, routeRes);
								}
							});
						} else {
							// sync route res processing
							routeRes = normalizeReqRes(routeRes(req, res));
							sendRes(res, routeRes);
						}
					} else {
						// if route res is object
						sendRes(res, routeRes);
					}
				} else {
					log(
						'several routes matches request: ' +
						JSON.stringify(matched)
					);

					res.writeHead(409);
					res.end();
				}
			} else {
				log('route for request not found');

				res.writeHead(404);
				res.end();
			}
		});

		/**
		 * Helpers used above
		 */
		function log(str) {
			if (logLevel <= logLevels.info) {
				console.log('[mocksrv] [req ' + reqId + '] ' + str);
			}
		}

		function debug(str) {
			if (logLevel <= logLevels.debug) {
				log('[debug] ' + str);
			}
		}

		function getReqMatcher(req) {
			return function(route) {
				var isRegexRoute = helpers.isRegExp(route.url);
				var isMatch = false;
				var reqMethod = req.method.toLowerCase();
				var routeMethod = route.method.toLowerCase();
				var isMethodMatch = routeMethod === 'all' || routeMethod === reqMethod;
				var isUrlMatch = isRegexRoute ? route.url.test(req.url) :
					req.url === route.url;

				// TODO add headers matching
				if (isMethodMatch && isUrlMatch) {
					if (route.req) {
						var routeReq = route.req;

						if (helpers.isFunction(routeReq)) {
							routeReq = normalizeReqRes(routeReq(req));
						}

						if (helpers.isObject(routeReq) && routeReq.body) {
							isMatch = req.body == routeReq.body;

							debug([
								'request body matching: ',
								'    expected : ' + routeReq.body,
								'    actual   : ' + req.body,
								'    is match : ' + isMatch
							].join('\n'));
						} else {
							isMatch = true;

							debug('route is match (because without req body criterion)');
						}
					} else {
						isMatch = true;

						debug('route is match (because without req criterion)');
					}
				}

				return isMatch;
			}
		}

		function sendRes(res, routeRes) {
			res.writeHead(routeRes.status, routeRes.headers);

			if (routeRes.body) {
				res.write(routeRes.body);
			} else {
				log('response without body was sended');
			}

			res.end();
		}
	});

	function logLevelToInt(logLevel) {
		logLevel = logLevel.toLowerCase();
		if (logLevel in logLevels == false) {
			throw new Error('Unknown log level: ' + logLevel);
		}

		return logLevels[logLevel];
	}
};
