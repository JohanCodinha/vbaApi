const http = require('http')
const { logger, mount, parseJson, routes } = require('paperplane')
const { compose } = require('ramda')

const { guestLogin, userLogin } = require('./api/auth')

const port = process.env.PORT || 3001

const listening = err =>
  err ? console.error(err) : console.info(`Listening on port: ${port}`)

const endpoints = routes({
  '/auth/guest': guestLogin,
  '/auth': userLogin,
})

const opts = { errLogger: logger, logger }
const app = mount(
  compose(endpoints, parseJson),
  opts
)

http.createServer(app, opts).listen(port, listening)
module.exports = app
