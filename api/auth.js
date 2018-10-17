const { json } = require('paperplane')
const {
  Async, maybeToAsync, safeAfter, isObject, chain, liftA2, maybeToResult, map, bimap,
  propPath, resultToAsync, compose, constant, identity
} = require('crocks')
const { Resolved } = Async
const { merge, pick, converge, invoker, objOf, prop } = require('ramda')

const { errorResponse, toPromise,  tapLog } = require('../lib/utils')
const { signJwt, verifyJwt } = require('../lib/jwt')
const { getCookie } = require('../upstream/auth')
const { fetchUserDetails } = require('../upstream/userDetails')

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

const cookieStrToJwt = compose(objOf('jwt'), signJwt)
const login = form =>
  getCookie(form)
    .map(cookieStrToJwt)

const guestLogin = compose(
  toPromise,
  map(json),
  login,
  constant({ guest: 2, enter: 'Guest: I Agree' })
)

// Async e string -> Async e { username, userUid, displayName }
const getUserDetails = compose(
  chain(
    compose(
      maybeToAsync(
        errorResponse(502, { message: 'Upstream backend response error' })
      ),
      map(pick(['username', 'userUid', 'displayName'])),
      // {} -> Maybe {}
      safeAfter(isObject, prop('data'))
    )
  ),
  // Async e string -> Async e Response
  fetchUserDetails
)

const userLogin = compose(
  toPromise,
  // Async e {} -> Async e String
  map(json),
  // Async e string -> Async e { jwt::String , username::String, userUid::String, displayName::String }
  chain(
    converge(
      liftA2(merge),
      [
        compose(
          Resolved,
          // String -> { jwt::String }
          cookieStrToJwt
        ),
        // Async e string -> Async e { username, userUid, displayName }
        getUserDetails
      ]
    )
  ),
  // Async e { k: value } -> Async e string
  chain(getCookie),
  // Async e a -> Async b a
  bimap(errorResponse(400), identity),
  // Req -> Async e { key: string }
  resultToAsync(extractCredentials),
)

module.exports = {
  guestLogin,
  userLogin
}
