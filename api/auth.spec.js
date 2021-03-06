const test = require('tape')
const request = require('supertest')
const app = require('../main')
const { username, password } = require('../config/test.js')

test('Auth - guest login return jwt', async t => {
  const {body, status, type} = await request(app).get('/auth/guest')
  t.is(status, 200)
  t.is(typeof body.jwt, 'string')
  t.is(type, 'application/json')
  t.end()
})

test('Auth - user login return jwt', async t => {
  const { body, status, type } = await request(app)
    .post('/auth')
    .send({ username, password })
  t.is(status, 200)
  t.is(typeof body.jwt, 'string')
  t.is(typeof body.displayName, 'string')
  t.is(type, 'application/json')
  t.end()
})

test('Auth - user login return error with missing password', async t => {
  const { body, status, type } = await request(app)
    .post('/auth')
    .send({ username: 'Karen' })
  t.is(status, 400)
  t.is(type, 'application/json')
  t.is(Array.isArray(body.errors), true)
  t.is(!!body.errors.find(e => e.message === 'Missing required parameter: password'), true)
  t.is(body.errors.length, 1)
  t.end()
})

test('Auth - user login return error with missing username', async t => {
  const { body, status, type } = await request(app)
    .post('/auth')
    .send({ password: 'neccesary' })
  t.is(status, 400)
  t.is(type, 'application/json')
  t.is(Array.isArray(body.errors), true)
  t.is(!!body.errors.find(e => e.message === 'Missing required parameter: username'), true)
  t.is(body.errors.length, 1)
  t.end()
})

test('Auth - user login return error with missing credentials', async t => {
  const { body, status, type } = await request(app)
    .post('/auth')
    .send({})
  t.is(status, 400)
  t.is(type, 'application/json')
  t.is(body.errors.length, 2)
  t.end()
})

test.onFinish(() => process.exit(0))
