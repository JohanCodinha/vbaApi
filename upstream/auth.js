const request = require('request-promise')
const { Async, constant, propOr, propPathOr } = require('crocks')
const { and, always, compose, cond, complement, propSatisfies, isEmpty, converge, or, call, equals, flip, gt, identity, invoker, isNil, mergeDeepLeft, not, prop, test } = require('ramda')
const { errorResponse } = require('../lib/utils')
// const notNil = compose(not, isNil)
const statusCodeProp = prop('statusCode')
const gt400 = flip(gt)(400)
const statusCodeGt400 = compose(gt400, statusCodeProp)
const statusCodeIs = code => compose(equals(code), statusCodeProp)
const urlContainsErrors = compose(test(/\?error=1/), propPathOr('', ['headers', 'location']))
// const extractCookies = flip(invoker(1, 'getCookieString'))
const { Rejected, Resolved } = Async

const getCookie = form => {
  return Async.fromPromise((url) => {
    const jar = request.jar()
    return request(
      {
        method: 'GET',
        url,
        timeout: 5000,
        jar,
        form,
        simple: false,
        resolveWithFullResponse: true
      })
      .then(x => mergeDeepLeft({ cookieString: jar.getCookieString(url) })(x))
      // .then(x=> (console.log('cookiestring',x.cookieString), x))
  }
  )('https://vba.dse.vic.gov.au/vba/login')
    .bimap(errorHandling, identity)
    .chain(responseHandling)
}

const errorHandling = error =>
  errorResponse(500, {
    code: 'INTERNAL_ERROR',
    message: 'Failure to connect with upstream',
    details: error.message,
    codeErr: error})

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
      converge(or,
        [
          urlContainsErrors,
          propSatisfies(isEmpty, 'cookieString')
        ]),
      compose(
        Rejected,
        errorResponse(401),
        constant({
          code: 'INTERNAL_ERROR',
          message: 'Login with upstream system failled'
        })
      )
    ],
    [
      converge(and,
        [
          statusCodeIs(303),
          propSatisfies(complement(isEmpty), 'cookieString')
        ]),
      compose(
        Resolved,
        prop('cookieString')
      )
    ]

  ])

module.exports = {
  getCookie
}
