import test from 'ava'
import request from 'supertest'
import app from '../main'
import { username, password } from '../config/test.js'

test.beforeEach(async t => {
  t.context.request = request(app)
})

test('Search - should validate token', async t => {
  console.log('start')
  const { body: { token }, status, type } = await t.context.request
    .post('/auth')
    .send({ username, password })
  console.log(token)
  const { body } = await t.context.request
    .pose('/search/point')
    .send({ token })
  console.log(body);
  t.is(typeof body, 'object')
})
