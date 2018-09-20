const { json } = require('paperplane')
const {
  Async, chain, liftA2, maybeToResult, map, bimap,
  propPath, resultToAsync, compose, constant, identity
} = require('crocks')
const { Resolved } = Async
const { merge, pick, prop, props, converge, invoker, objOf } = require('ramda')

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

const cookieStrToJwt = compose(objOf('jwt'), signJwt)
const login = form =>
  getCookie(form)
    .map(cookieStrToJwt)

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
  map(tapLog),
  chain(
    converge(
      liftA2(merge),
      [
        compose(
          Resolved,
          cookieStrToJwt
        ),
        compose(
          map(
            compose(
              pick(['username', 'userUid']),
              prop('data')
            )
          ),
          getUserDetails
        )
      ]
    )
  ),
  chain(getCookie),
  bimap(errorResponse(400), identity),
  resultToAsync(extractCredentials)
)

module.exports = {
  guestLogin,
  userLogin
}
