# mocky

mocky - http mocking server with simple config written on nodejs

[![Build Status](https://travis-ci.org/2do2go/mocky.svg?branch=master)](https://travis-ci.org/2do2go/mocky)

## Installation

```
npm install mocky
```

## Examples

Create new mock.js file with content

```js
var mocky = require('mocky');

mocky.createServer([{
// simple GET route without request body to match
	url: '/someurl1?a=b&c=d',
	method: 'get',
	res: 'response for GET request'
}, {
// POST route with request body to match and respose with status, headers and body
	url: '/someurl2?a=b&c=d',
	method: 'post',
	req: 'POST request body to match',
	res: {
		status: 202,
		headers: {'Content-type': 'text/html'},
		body: '<div>response to return to client</div>'
	}
}, {
// PUT route with dynamic response body
	url: '/someurl3?a=b&c=d',
	method: 'put',
	req: 'PUT request body to match',
	res: function(req, res) {
		return 'PUT response body';
	}
}, {
// GET route with regexp url and async response with status, headers and body
	url: /\/someurl4\?a=\d+/,
	method: 'get',
	res: function(req, res, callback) {
		setTimeout(function() {
			callback(null, {
				status: 202,
				headers: {'Content-type': 'text/plain'},
				body: 'async response body'
			});
		}, 1000);
	}
}]).listen(4321);

```

That's all now you can run mock server `node mock.js`, after
that if you send `GET` request to `http://127.0.0.1:4321/someurl1?a=b&c=d` and
get `response for GET request` to the client, send `POST` request to
`http://127.0.0.1:4321/someurl?a=b&c=d` with body `POST request body to match`
... and so on, just try it.

## Requests recording

It's very handy to auto record requests, do it somewhere at start of your main
app file

```js
mocky.recorder.start({print: true});
```

After that all http/https requests will be logged into console immediately after
execution.

You also can manually control `recorder` - `start` recorder then after some
requests occures you can manually process recorder `outputs` e.g.

```js
console.log(mocky.recorder.outputs)
```

You also can `stop` recorder and `clear` outputs.

```js
mocky.recorder.stop();
mocky.recorder.clean();
```

## Running test

Into cloned repository run

```
npm test
```

## TODO
* improve server logging
* support request headers matching
