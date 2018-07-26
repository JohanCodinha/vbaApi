import test from 'ava'
import { parser } from '../lib/parser'
import parserInputs from '../config/parserInputs'
// test.beforeEach(async t => {
//   t.context.request = request(app)
// })

test('Parser should parse unquoted JSON', async t => {
  const results = parserInputs.map(parser)
  // console.dir(results, {depth: null})
  t.is(results.length, parserInputs.length)
})
