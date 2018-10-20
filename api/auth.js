const { json } = require('paperplane')
const {
  Async, maybeToAsync, safeAfter, isObject, chain, liftA2, map,
  compose, constant, identity, either, isString
} = require('crocks')
const { Resolved } = Async
const { allPass, merge, complement, isEmpty, pick, converge, objOf, prop } = require('ramda')

const { errorResponse, toPromise } = require('../lib/utils')
const { signJwt } = require('../lib/jwt')
const { getCookie } = require('../upstream/auth')
const { fetchUserDetails } = require('../upstream/userDetails')
const { extractValidateParams } = require('./extractParams')

// cookieStrToJwt :: String -> { jwt: String }
const cookieStrToJwt = compose(objOf('jwt'), signJwt)
const login = form =>
  getCookie(form)
    .map(cookieStrToJwt)

// guestLogin :: a -> Async e b
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
  // string -> Async e Response
  fetchUserDetails
)

const liftedGetCookie = liftA2(
  username => password => getCookie({ username, password })
)
// mergeUserDetailsWithJwt :: String-> Async e { jwt, ...userDetails }
const mergeUserDetailsWithJwt = converge(
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
const eitherToAsync = either(compose(Async.Rejected, errorResponse(400)), identity)

const userLogin = compose(
  toPromise,
  // Async e {} -> Async e String
  map(json),
  // Async e string -> Async e { jwt::String , username::String, userUid::String, displayName::String }
  chain(mergeUserDetailsWithJwt),
  eitherToAsync,
  // getCookie:: username -> password -> Async e string
  ({ username, password }) => liftedGetCookie(username, password),
  // Result e { key: Result }
  extractValidateParams({
    username: allPass([ isString, complement(isEmpty) ]),
    password: complement(isEmpty)
  })
)

module.exports = {
  guestLogin,
  userLogin
}
