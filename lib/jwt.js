const { curry } = require('ramda')
const { binary, tryCatch } = require('crocks')
const { sign, verify } = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret'
const thirtyMinFromNow = Math.floor(Date.now() / 1000) - (60 * 30)

const jwtSigning = curry((secret, expiration, data) =>
  sign({
    data,
    ext: expiration
  }, secret))

const signJwt = jwtSigning(JWT_SECRET, thirtyMinFromNow)

const jwtVerifying =
  secret => token => verify(token, secret)

//  tryCatch(secret => token => verify(token, secret))(token, secret)

const verifyJwt = tryCatch(jwtVerifying(JWT_SECRET))

module.exports = { signJwt, verifyJwt }
