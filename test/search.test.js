const test from 'ava'
const request from 'supertest'
const app from '../main'
const { username, password } from '../config/test.js'

test.beforeEach(async t => {
  t.context.request = request(app)
})

test('Search - should validate token', async t => {
  const { body: { jwt }, status, type } = await t.context.request
    .post('/auth')
    .send({ username, password })
  const { body } = await t.context.request
    .post('/search/point')
    .send({ token: jwt })
  console.log(body);
  t.is(typeof body, 'object')
})
