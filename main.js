const http = require('http')
const { json, logger, methods, mount, parseJson, routes } = require('paperplane')
const { Async, propPath, maybeToAsync, maybeToResult, tap, Result, map } = require('crocks')
const { Err, Ok } = Result
const { always, compose, curry, identity, lt, objOf } = require('ramda')

const { guestLogin } = require('./api/auth')

const port = process.env.PORT || 3001

const listening = err =>
  err ? console.error(err) : console.info(`Listening on port: ${port}`)
const log = x => console.log(x)
const login = req =>
  Ok(username => password => ({ username, password }))
    .ap(
      maybeToResult(['Missing username'], propPath(['body', 'username']))(req)
    )
    .ap(
      maybeToResult(['Missing password'], propPath(['body', 'password']))(req)
    )
    .bimap(log, log)

const endpoints = routes({
  '/auth/guest': guestLogin,
  '/auth': login
})

const opts = { errLogger: logger, logger }
const app = mount(
  compose(endpoints, parseJson),
  opts)
module.exports = app
http.createServer(app, listening)
