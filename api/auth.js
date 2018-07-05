const { json } = require('paperplane')
const { Async, propPath, maybeToAsync, tap } = require('crocks')
const { always, compose, curry, identity, lt, objOf } = require('ramda')
const { error, signJwt, log } = require('../lib/utils')
const { fetchGuestCookie } = require('../upstream/auth')

const guestLogin = req =>
  Async.fromPromise(fetchGuestCookie)()
    .chain(maybeToAsync(
      new Error('Could not parse cookie'),
      propPath(['headers', 'set-cookie'])
    ))
    .map(compose(
      objOf('jwt'),
      signJwt
    ))
    .coalesce(
      error(503),
      json
    )
    .toPromise()

module.exports = {
  guestLogin
}
