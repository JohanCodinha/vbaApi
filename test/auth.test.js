import test from 'ava'
import request from 'supertest'
import app from '../main'
import { username, password } from '../config/test.js'

test.beforeEach(async t => {
  t.context.request = request(app)
})

test('Auth - guest login return jwt', async t => {
  const {body, status, type} = await t.context.request.get('/auth/guest')
  t.is(status, 200)
  t.is(typeof body.jwt, 'string')
  t.is(type, 'application/json')
})

test('Auth - user login return jwt', async t => {
  const { body, status, type } = await t.context.request
    .post('/auth')
    .send({ username, password })
  t.is(status, 200)
  t.is(typeof body.jwt, 'string')
  t.is(type, 'application/json')
})

test('Auth - user login return error with missing password', async t => {
  const { body, status, type } = await t.context.request
    .post('/auth')
    .send({ username: 'Karen' })
  t.is(status, 400)
  t.is(type, 'application/json')
  t.is(Array.isArray(body.errors), true)
  t.is(!!body.errors.find(e => e.message === 'Missing required parameter: password'), true)
  t.is(body.errors.length, 1)
})

test('Auth - user login return error with missing username', async t => {
  const { body, status, type } = await t.context.request
    .post('/auth')
    .send({ password: 'neccesary' })
  t.is(status, 400)
  t.is(type, 'application/json')
  t.is(Array.isArray(body.errors), true)
  t.is(!!body.errors.find(e => e.message === 'Missing required parameter: username'), true)
  t.is(body.errors.length, 1)
})

test('Auth - user login return error with missing credentials', async t => {
  const { body, status, type } = await t.context.request
    .post('/auth')
    .send({})
  t.is(status, 400)
  t.is(type, 'application/json')
  t.is(body.errors.length, 2)
})
