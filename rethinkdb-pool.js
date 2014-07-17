var poolModule = require('generic-pool');
var bluebird = require('bluebird');

module.exports = function(options) {
  var r = require('rethinkdb'),
    min = options.min || 2,
    max = options.max || 10,
    idleTimeoutMillis = options.idleTimeoutMillis || 60 * 60 * 1000, // 1 hour default (same as rethinkdb)
    acquire;

  // options are piped to r.connect()
  // except for these which are pool-specific
  delete options.min;
  delete options.max;
  delete options.idleTimeoutMillis;

  r.pool = poolModule.Pool({
    name: 'rethinkdb',
    create: function(done) {
      return r.connect(options, done);
    },
    destroy: function(connection) {
      return connection.close();
    },
    log: false,
    max: max,
    min: min,
    idleTimeoutMillis: idleTimeoutMillis
  });

  acquire = bluebird.promisify(r.pool.acquire);

  r.pool.run = function(query) {
    return acquire().then(function(conn) {
      return query.run.call(query, conn).then(function(cursorOrResult) {
        var result;

        if (cursorOrResult && typeof cursorOrResult.toArray === 'function') {
          result = cursorOrResult.toArray();
        } else {
          result = cursorOrResult;
        }
        r.pool.release(conn);
        return result;
      }).catch(function(e) {
        console.log('ERROR rethink', e.message, e.stack);
        throw e;
      });
    }).catch(function(e) {
      console.log('ERROR getting connection', e.message, e.stack);
      throw e;
    });
  };

  r.pool.drainAll = function() {
    r.pool.drain(function() {
      r.pool.destroyAllNow();
    });
  };

  return r;
};
