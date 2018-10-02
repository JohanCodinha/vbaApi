const { curry } = require('ramda')
const { tryCatch } = require('crocks')
const { sign, verify } = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret'
const thirtyMinFromNow = Math.floor(Date.now() / 1000) - (60 * 30)

const jwtSigning = curry((secret, expiration, data) =>
  sign({
    data,
    ext: expiration
  }, secret))

const signJwt = jwtSigning(JWT_SECRET, thirtyMinFromNow)

const verifyJwt = secret => token =>
  tryCatch(verify(token, secret))

module.exports = { signJwt, verifyJwt }
