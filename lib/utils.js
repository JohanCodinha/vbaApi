const { curry, invoker, tap } = require('ramda')
const { sign } = require('jsonwebtoken')

const error = (statusCode = 500) =>
  ({ message = 'Unexpected condition was encountered' }) => ({
    body: JSON.stringify({ error: message }),
    headers: {
      'content-type': 'application/json'
    },
    statusCode
  })

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

module.exports = { error, log, signJwt, tapLog, toPromise }
