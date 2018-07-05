const http = require('http')
const { json, logger, methods, mount, parseJson, routes } = require('paperplane')
const { Async, propPath, maybeToAsync, tap } = require('crocks')
const { always, compose, curry, identity, lt, objOf } = require('ramda')

const { guestLogin } = require('./api/auth')

const port = process.env.PORT || 3001

const listening = err =>
  err ? console.error(err) : console.info(`Listening on port: ${port}`)

const endpoints = routes({
  '/auth/guest': guestLogin
})

const opts = { errLogger: logger, logger }
const app = compose(endpoints, parseJson)
http.createServer(mount(app, opts)).listen(port, listening)
