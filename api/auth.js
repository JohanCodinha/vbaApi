const { json } = require('paperplane')
const {
  Async, chain, liftA2, maybeToResult,
  propPath, resultToAsync, compose, constant
} = require('crocks')
const { Resolved } = Async
const { converge, invoker, objOf } = require('ramda')

const { error, signJwt } = require('../lib/utils')
const { getCookie } = require('../upstream/auth')

const toPromise = invoker(0, 'toPromise')

const extractCredentials = converge(
  liftA2(username => password => ({ username, password })),
  [
    maybeToResult(['Missing username'], propPath(['body', 'username'])),
    maybeToResult(['Missing password'], propPath(['body', 'password']))
  ]
)

const login = form =>
  getCookie(form)
    .map(compose(objOf('jwt'), signJwt))
    .coalesce(error(503), json)

const guestLogin = compose(
  toPromise,
  chain(login),
  Resolved,
  constant({ guest: 2, enter: 'Guest: I Agree' })
)

const userLogin = compose(
  toPromise,
  chain(login),
  resultToAsync(extractCredentials)
)

module.exports = {
  guestLogin,
  userLogin
}
