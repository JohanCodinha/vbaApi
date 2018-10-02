const { json } = require('paperplane')
const {
  map,
  propPath, resultToAsync, compose
} = require('crocks')
const { tapLog } = require('../lib/utils')
const { verifyJwt } = require('../lib/jwt')

const searchByLocation = compose(
  map(json),
  map(tapLog),
  //resultToAsync,
  map(tapLog),
  //map(verifyJwt),
  map(tapLog),
  propPath(['body', 'token'])
)

module.exports = {
  searchByLocation
}
