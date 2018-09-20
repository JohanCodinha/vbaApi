const { slice, compose, invoker, tryCatch } = require('ramda')
const { curry } = require('crocks')

const match = invoker(1, 'match')
const regexWrapper = /\/\/isc_RPCResponseStart-->(.*?)\/\/isc_RPCResponseEnd/

Date.parseServerDate = curry((y, m, d) => new Date(`${m}/${d}/${y}`))
const looseJsonParse = obj =>
  // eslint-disable-next-line no-new-func
  Function('"use strict";return function(Date){ return (' + obj + ')}')()(Date)

const parser = compose(
  tryCatch(looseJsonParse, (e) => (console.log(e), 'nope')),
  slice(1, 2),
  match(regexWrapper)
)
module.exports = {
  parser
}
