# revolt-json-parser

* Parses response bodies as JSON
* Only executes if `Content-Type` is equal to `application/json` or ends in `+json`

## Install

```
npm install revolt-json-parser
```

## Example

```js
var revolt = require('revolt');
var jsonParser = require('revolt-json-parser');

var client = revolt()
  .use(jsonParser);

client
  .get('http://localhost:1337/users')
  .subscribe(function(env) {
    console.log(typeof env.response.body) // object
  });
```

## License

MIT
