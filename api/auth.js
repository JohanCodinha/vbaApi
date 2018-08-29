const { json } = require('paperplane')
const {
  Async, chain, liftA2, maybeToResult, map, bimap,
  propPath, resultToAsync, compose, constant, identity
} = require('crocks')
const { Resolved } = Async
const { converge, invoker, objOf } = require('ramda')

const { errorResponse, signJwt, tapLog } = require('../lib/utils')
const { getCookie } = require('../upstream/auth')
const { getUserDetails } = require('../upstream/userDetails')

const toPromise = invoker(0, 'toPromise')

const extractCredentials = converge(
  liftA2(username => password => ({ username, password })),
  [
    maybeToResult([{
      parameter: 'username',
      code: 'INVALID_PARAMETER',
      message: 'Missing required parameter: username'}], propPath(['body', 'username'])),
    maybeToResult([{
      parameter: 'password',
      code: 'INVALID_PARAMETER',
      message: 'Missing required parameter: password'}], propPath(['body', 'password']))
  ]
)

const login = form =>
  getCookie(form)
    // .map(x => (console.log('auth.js:', x), x))
    .map(compose(objOf('jwt'), signJwt))

const guestLogin = compose(
  toPromise,
  map(json),
  chain(login),
  Resolved,
  constant({ guest: 2, enter: 'Guest: I Agree' })
)

const userLogin = compose(
  toPromise,
  map(json),
  map(compose(objOf('jwt'), signJwt)),
  map(tapLog),
  chain(getUserDetails),
  chain(getCookie),
  bimap(errorResponse(400), identity),
  resultToAsync(extractCredentials)
)

module.exports = {
  guestLogin,
  userLogin
}
