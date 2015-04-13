var Stream = require('stream');
var Rx = require('rx');
Rx.Node = require('rx-node');

module.exports = function(handle) {
  handle('response', function(pipeline) {
    return pipeline.flatMap(function(env) {
      if (!env.response.body) {
        return Rx.Observable.fromArray([env]);
      }

      var typeHeader = env.response.headers['content-type'];

      var shouldParse = true;
      if (typeHeader) {
        var type = typeHeader.toLowerCase().split(';')[0]
        if (type === 'application/json'
          || (type.length > 5 && type.slice(-5) === '+json')) {
          shouldParse = true;
        } else {
          shouldParse = false;
        };
      }

      if (!shouldParse) {
        return Rx.Observable.fromArray([env]);
      }

      if (env.response.body instanceof Stream) {
        return Rx.Node.fromStream(env.response.body)
          .reduce(function(acc, data) {
            acc.length += data.length;
            acc.buffers.push(data);

            return acc;
          }, { length: 0, buffers: [] })
          .map(function(body) {
            var body = Buffer.concat(body.buffers, body.length);
            if (body.length) {
              env.response.body = JSON.parse(body.toString());
            }
            return env;
          })
      } else if (typeof env.response.body === 'string') {
        var body = env.response.body.length ? JSON.parse(env.response.body) : null;
        return Rx.Observable.fromArray([body]);
      } else if (env.response.body instanceof Buffer) {
        var body = env.response.body.length ? JSON.parse(env.response.body.toString()) : null;
        return Rx.Observable.fromArray([body]);
      }
    });
  });
};
