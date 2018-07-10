import test from 'ava'
import request from 'supertest'
import app from '../main'
import { username, password } from '../config/test.js'

test.beforeEach(async t => {
  t.context.request = request(app)
})

test('guest login return jwt', async t => {
  const {body, status, type} = await t.context.request.get('/auth/guest')
  console.log(body.token)
  t.is(status, 200)
  t.is(typeof body.token, 'string')
  t.is(type, 'application/json')
})

test('user login return jwt', async t => {
  const { body, status, type } = await t.context.request
    .post('/auth')
    .send({ username, password })
  t.is(status, 200)
  t.is(typeof body.token, 'string')
  t.is(type, 'application/json')
})

test('user login return error with missing password', async t => {
  const { body, status, type } = await t.context.request
    .post('/auth')
    .send({ username: 'Karen' })
  t.is(status, 422)
  t.is(type, 'application/json')
  t.is(typeof body.errors, 'array')
  t.is(body.erros.messages.includes('Missing required parameter: password'), true)
  t.is(body.erros.messages.lenght, 1)
})

test('user login return error with missing username', async t => {
  const { body, status, type } = await t.context.request
    .post('/auth')
    .send({ password: 'neccesary' })
  t.is(status, 422)
  t.is(type, 'application/json')
  t.is(typeof body.errors, 'array')
  t.is(body.erros.messages.includes('Missing required parameter: username'), true)
  t.is(body.erros.messages.lenght, 1)
})

test('user login return error with missing credentials', async t => {
  const { body, status, type } = await t.context.request
    .post('/auth')
    .send({})
  t.is(status, 422)
  t.is(type, 'application/json')
  t.is(type, 'application/json')
  t.is(body.erros.messages.includes('Missing required parameter: username'), true)
  t.is(body.erros.messages.includes('Missing required parameter: password'), true)
  t.is(body.erros.messages.lenght, 2)
})
