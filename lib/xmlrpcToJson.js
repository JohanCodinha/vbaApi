const { slice, map, compose, invoker } = require('ramda')
const { curry, tryCatch } = require('crocks')

const match = invoker(1, 'match')
const regexWrapper = /\/\/isc_RPCResponseStart-->(.*?)\/\/isc_RPCResponseEnd/

Date.parseServerDate = curry((y, m, d) => new Date(`${m}/${d}/${y}`))
const looseJsonParse = obj =>
  // eslint-disable-next-line no-new-func
  Function('"use strict";return function(Date){ return (' + obj + ')}')()(Date)

const parser = compose(
  tryCatch(looseJsonParse),
  slice(1, 2),
  match(regexWrapper)
)
module.exports = {
  parser
}
