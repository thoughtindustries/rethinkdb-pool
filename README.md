rethinkdb-pool
==============

A Node.JS Connection Pool for RethinkDB.

RethinkDB is [Actively working on](https://github.com/rethinkdb/rethinkdb/issues/281) their own connection pool for all the official drivers, which is super great and once that is out you should definitely use that instead of this.

But maybe you're interested in _today_, not _tomorrow_. Me too.

Using it is easy:

```js
var r = require('ti-rethinkdb-pool')();

r.pool.run(..your rethinkdb query here..).then(function(res) {
  // do something with the result.
});
```

It returns a promise which you can consume however you like.

It works great with harmony node's generators & [co](https://github.com/visionmedia/co):

```js
var r = require('ti-rethinkdb-pool');
var co = require('co');

co(function *() {
  var res = yield r.pool.run(r.table('foo'));
  // do something with the result.
});
```

How does this differ from...
----------------------------

 - [rethinkdbdash](https://github.com/neumino/rethinkdbdash): We use the official rethinkdb driver.
 - [hden's rethinkdb-pool](https://github.com/hden/rethinkdb-pool): We return promises and you only have to carry around one `r` object, not an `r` and a `pool`.

Also...
-------

It automatically `.toArray()`'s cursors, so you should never have to deal with cursors directly, nor have to worry about releasing the pool connection after you are done with the cursor. There is currently no provision if you _want_ to deal with cursors directly, but it looks like the official RethinkDB connection pool will.

This monkeypatches the `r` namespace, which is definitely a no-no, but is also the cleanest way I could come up with to only pass around one object (`r`) when making queries.

Options
-------

```js
var r = require('lib/rethinkdb_pool')({
  host: 'localhost',
  port: '28015',
  db: 'test',
  authKey: null,
  min: 2,
  max: 10
});
```
