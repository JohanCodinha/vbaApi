const test = require('tape')
const { parser } = require('./xmlrpcToJson')
const parserInputs = require('../config/parserInputs')

test('Parser should parse unquoted JSON', async t => {
  const results = parserInputs.map(parser)
  // console.dir(results, {depth: null})
  t.is(results.length, parserInputs.length)
  t.end()
})
