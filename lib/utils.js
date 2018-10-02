const { compose, curryN, invoker, is, objOf, of, tap, unless } = require('ramda')

const formatErrors = compose(
  objOf('errors'),
  unless(is(Array), of)
)

const errorResponse = curryN(2,
  (
    statusCode = 500,
    errors = [{message: 'Unexpected condition was encountered'}]
  ) => ({
    body: compose(
      JSON.stringify,
      formatErrors
    )(errors),
    headers: {
      'content-type': 'application/json'
    },
    statusCode
  })
)

const log = x => console.log(x)
const tapLog = tap(log)
const toPromise = invoker(0, 'toPromise')

module.exports = { errorResponse, log, tapLog, toPromise }
