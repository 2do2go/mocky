'use strict';

/**
 * Simple mock server
 */

module.exports.createServer = function(params) {
	var logLevels = {'debug': 1, 'info': 2, 'none': 3};
	var params = params || {},
		routes = params.routes,
		srvType = params.srvType || 'http',
		srvOpts = params.srvOpts || {},
		logLevel = logLevelToInt(params.logLevel || 'info'),
		reqSeq = 0;
	return require(srvType).createServer(function(req, res) {
		var reqId = reqSeq++,
			body = '';
		req.on('data', function(chunk) {
			body += chunk;
		}).on('end', function() {
			log(
				'[' + new Date().toGMTString() + '] method: ' +
				req.method + ' url: ' + req.url + ' reqBody: ' + body
			);
			var matched = routes.filter(reqMatcher(req.url, req.method, body));
			if (matched.length) {
				if (matched.length == 1) {
					var routerRes = matched[0].res;
					if (isFunction(routerRes)) routerRes = routerRes(req, body);
					if ('body' in routerRes) {
						res.writeHead(200);
						res.write(routerRes.body);
					}
				} else {
					log(
						'several routes matches request: ' +
						JSON.stringify(matched)
					);
					res.writeHead(409);
				}
			} else {
				log('route for request not found');
				res.writeHead(404);
			}
			res.end();
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
		function reqMatcher(url, method, body) {
			return function(route) {
				if (method == route.method && url == route.url) {
					if ('req' in route && 'body' in route.req) {
						debug([
							'is request body match: ',
							'    expected :' + route.req.body,
							'    actual   :' + body,
							'    is match :' + (body == route.req.body)
						].join('\n'));
						return body == route.req.body;
					} else {
						debug('router match (because without body criterion)');
						return true;
					}
				}
			}
		}
	});

	function logLevelToInt(logLevel) {
		logLevel = logLevel.toLowerCase();
		if (logLevel in logLevels == false) {
			throw new Error('Unknown log level: ' + logLevel);
		}
		return logLevels[logLevel];
	}

	function isFunction(value) {
		return Object.prototype.toString.call(value) == '[object Function]';
	}
};
