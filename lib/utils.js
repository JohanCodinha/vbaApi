const { compose, curry, curryN, invoker, is, objOf, of, tap, unless } = require('ramda')
const { sign } = require('jsonwebtoken')

const formatErrors = compose(
  objOf('errors'),
  unless(is(Array), of)
)
const errorResponse = curryN(2,
  (
    statusCode = 500,
    errors = [{message: 'Unexpected condition was encountered'}]
  ) => ({
    body: compose(
      JSON.stringify,
      formatErrors
    )(errors),
    headers: {
      'content-type': 'application/json'
    },
    statusCode
  })
)
const jwtSigning = curry((secret, expiration, data) =>
  sign({
    data,
    ext: expiration
  }, secret))

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret'
const thirtyMinFromNow = Math.floor(Date.now() / 1000) - (60 * 30)
const signJwt = jwtSigning(JWT_SECRET, thirtyMinFromNow)

const log = x => console.log(x)
const tapLog = tap(log)
const toPromise = invoker(0, 'toPromise')

module.exports = { errorResponse, log, signJwt, tapLog, toPromise }
