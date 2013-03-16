# mocky

mocky - http mocking server with simple config written on nodejs

## Installation

```
npm install mocky
```

## Examples

create new mock.js file with content

```javascript
var mocky = require('mocky');

mocky.createServer([{
//simple get route without request body to match
	url: '/someurl?a=b&c=d',
	method: 'GET',
	res: {body: 'response for GET request'}
}, {
//post route with body to match
	url: '/someurl?a=b&c=d',
	method: 'POST',
	req: {body: 'POST request body to match'},
	res: {body: 'response to return to client'}
}, {
//put route with dynamic response body
	url: '/someurl?a=b&c=d',
	method: 'PUT',
	req: {body: 'PUT request body to match'},
	res: function(req, reqBody) {
		return {body: '[ ' + reqBody + ' ]'};
	}
}]).listen(4321);

```

that's all now you can run mock server `node mock.js`, after
that if you send `GET` request to `http://127.0.0.1:4321/someurl?a=b&c=d` and
get `response for GET request` to the client, send `POST` request to
`http://127.0.0.1:4321/someurl?a=b&c=d` with body `POST request body to match`
... and so on, just try it.

## Running test

into cloned repository run

```
npm test
```

## TODO
* improve server logging
* support request, response headers
* tool for auto capturing routes from working app
