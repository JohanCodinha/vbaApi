const http = require('http')
const { logger, mount, parseJson, routes } = require('paperplane')
const { compose } = require('ramda')

const { guestLogin, userLogin } = require('./api/auth')
const { searchByLocation } = require('./api/search')

const port = process.env.PORT || 3001

const listening = err =>
  err ? console.error(err) : console.info(`Listening on port: ${port}`)

const endpoints = routes({
  '/auth/guest': guestLogin,
  '/auth': userLogin,
  '/search/point': searchByLocation
})

const app = mount({
  app: compose(endpoints, parseJson),
  logger
})

http.createServer(app).listen(port, listening)
module.exports = app
