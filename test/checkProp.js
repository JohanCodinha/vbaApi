const test = require('tape')
const request = require('supertest')
const app = require('../main')
const { username, password } = require('../config/test.js')

const server = request(app)

test('Search - should validate token', async t => {
  const { body: { jwt }, status, type } = await server
    .post('/auth')
    .send({ username, password })
  const { body } = await server
    .post('/search/point')
    .send({ token: jwt })
  console.log(body);
  t.is(typeof body, 'object')
  t.end()
})

