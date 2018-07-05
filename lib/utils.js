const { always, compose, curry, identity, lt, objOf } = require('ramda')
const { sign } = require('jsonwebtoken')
const error = (statusCode = 500) => ({ message = 'Unexpected condition was encountered' }) => ({
  body: JSON.stringify({ error: message }),
  headers: {
    'content-type': 'application/json'
  },
  statusCode
})

const jwtSigning = curry((secret, expiration, data) => sign({
  data,
  ext: expiration
}, secret))

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret'
const thirtyMinFromNow = Math.floor(Date.now() / 1000) - (60 * 30)
const signJwt = jwtSigning(JWT_SECRET, thirtyMinFromNow)

const log = x => console.log(x)

module.exports = { error, signJwt, log }
