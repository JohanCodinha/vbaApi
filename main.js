const http = require('http')
const { logger, mount, parseJson, routes } = require('paperplane')
const { compose } = require('ramda')

const { guestLogin, userLogin } = require('./api/auth')
const { searchByLocation } = require('./api/search')

const port = process.env.PORT || 3001

Error.stackTraceLimit = Infinity

const listening = err =>
  err ? console.error(err) : console.info(`Listening on port: ${port}`)

const endpoints = routes({
  '/auth/guest': guestLogin,
  '/auth': userLogin,
  '/search/point': searchByLocation
})

const app = mount({
  app: compose(x => x.catch(x => {console.log(x); debugger; throw(x)}), endpoints, parseJson),
  logger
})

http.createServer(app).listen(port, listening)
module.exports = app
