const test = require('tape')
const request = require('supertest')
const app = require('../main')
const { username, password } = require('../config/test.js')

test('Search - should validate token', async t => {
  const { body: { jwt }, status, type } = await request(app)
    .post('/auth')
    .send({ username, password })
  const { body } = await request(app)
    .post('/search/point')
    .send({
      details: true,
      longitude: 145.09684546098637,
      latitude: -36.70419866295145,
      radius: 1000,
      token: jwt })
  //console.log('response from test', body)
  t.is(typeof body, 'object')
  t.end()
})

test.onFinish(() => process.exit(0))
