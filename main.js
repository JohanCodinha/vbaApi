const { logger, mount, parseJson, routes } = require('paperplane')
const { compose } = require('ramda')

const { guestLogin, userLogin } = require('./api/auth')
const { searchByLocation } = require('./api/search')

Error.stackTraceLimit = Infinity

const endpoints = routes({
  '/auth/guest': guestLogin,
  '/auth': userLogin,
  '/search/point': searchByLocation
})

const app = mount({
  app: compose(
    // x => x.catch(x => {console.log(x); debugger; throw(x)}),
    endpoints,
    parseJson
  ),
  logger
})

module.exports = app
