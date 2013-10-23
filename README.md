# mocky

mocky - http mocking server with simple config written on nodejs

## Installation

```
npm install mocky
```

## Examples

create new mock.js file with content

```js
var mocky = require('mocky');

mocky.createServer([{
//simple GET route without request body to match
	url: '/someurl?a=b&c=d',
	method: 'GET',
	res: 'response for GET request'
}, {
//POST route with body to match
	url: '/someurl?a=b&c=d',
	method: 'POST',
	req: 'POST request body to match',
	res: 'response to return to client'
}, {
//PUT route with dynamic response body
	url: '/someurl?a=b&c=d',
	method: 'PUT',
	req: 'PUT request body to match',
	res: function(req, reqBody) {
		return '[ ' + reqBody + ' ]';
	}
}, {
//GET route with regexp url instead of string
	url: /\/someurl\?a=\d+/,
	method: 'GET',
	res: 'response from route with regexp in url'
}]).listen(4321);

```

that's all now you can run mock server `node mock.js`, after
that if you send `GET` request to `http://127.0.0.1:4321/someurl?a=b&c=d` and
get `response for GET request` to the client, send `POST` request to
`http://127.0.0.1:4321/someurl?a=b&c=d` with body `POST request body to match`
... and so on, just try it.

## Requests recording

it's very handy to auto record requests, do it somewhere at start of your main
app file

```js
mocky.recorder.start({print: true});
```

after that all http/https requests will be logged into console immediately after
execution.

You also can manually control `recorder` - `start` recorder then after some
requests occures you can manually process recorder `outputs` e.g.

```js
console.log(mocky.recorder.outputs)
```

you also can `stop` recorder and `clear` outputs.

## Running test

into cloned repository run

```
npm test
```

## TODO
* improve server logging
* support request, response headers
