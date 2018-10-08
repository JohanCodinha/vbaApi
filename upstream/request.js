const request = require('request-promise')

const { Async, prop, maybeToAsync, map, chain, resultToAsync } = require('crocks')

const {
  curry,
  head,
  compose } = require('ramda')

const { errorResponse, tapLog } = require('../lib/utils')
const requestOptionsFormatter = require('./requestOptions.js')
const { parser } = require('../lib/xmlrpcToJson')
const parse = compose(
  resultToAsync,
  map(head),
  parser
)

const fetch = compose(
  chain(parse),
  chain(
    compose(
      maybeToAsync(errorResponse(400)),
      prop('body')
    )
  ),
  Async.fromPromise(request),
  requestOptionsFormatter
)

module.exports = {
  fetch: curry(fetch)
}
