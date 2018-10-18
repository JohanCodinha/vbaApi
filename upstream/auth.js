const request = require('request-promise-native')
const { Async, curry, maybeToAsync, constant, chain, bimap, propPath, propPathOr } = require('crocks')
const { T, head, merge, objOf, split, join, map, compose, cond,
  equals, flip, gt, identity, prop, test } = require('ramda')
const { errorResponse, tapLog } = require('../lib/utils')
const statusCodeProp = prop('statusCode')
const gt400 = flip(gt)(400)
const statusCodeGt400 = compose(gt400, statusCodeProp)
const statusCodeIs = code => compose(equals(code), statusCodeProp)
const { Rejected, Resolved } = Async

const requestBaseOption = {
  method: 'POST',
  url: 'https://vba.dse.vic.gov.au/vba/login',
  timeout: 5000,
  simple: false,
  resolveWithFullResponse: true
}
const errorHandling = error =>
  errorResponse(500, {
    code: 'INTERNAL_ERROR',
    message: 'Failure to connect with upstream',
    details: error.message,
    codeErr: error})

const cleanResCookie = compose(
  join('; '),
  map(
    compose(
      head,
      split(';')
    )
  )
)

const urlContainsErrors = compose(
  test(/\?error=1/),
  propPathOr('', ['headers', 'location'])
)

const responseHandling =
  cond([
    [
      statusCodeGt400,
      compose(
        Rejected,
        errorResponse(500),
        (code) => ({
          code: 'INTERNAL_ERROR',
          message: `Upstream system returned error code: ${code}`
        }),
        prop('statusCode')
      )
    ],
    [
      urlContainsErrors,
      compose(
        Rejected,
        errorResponse(401),
        constant({
          code: 'FAILLED_LOGIN',
          message: 'Login with upstream system failled'
        })
      )
    ],
    [
      statusCodeIs(302),
      compose(
        maybeToAsync('error'),
        map(cleanResCookie),
        propPath(['headers', 'set-cookie'])
      )
    ],
    [
      T,
      Rejected
    ]
  ])

// Async e { k: value } -> Async e string
const getCookie = compose(
  chain(responseHandling),
  bimap(errorHandling, identity),
  Async.fromPromise(request),
  merge(requestBaseOption),
  // { form: { username, password } }
  objOf('form')
)

module.exports = {
  getCookie
}
