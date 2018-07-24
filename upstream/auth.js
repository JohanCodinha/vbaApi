const request = require('request')
const { Async, constant, propPathOr } = require('crocks')
const { compose, cond, equals, flip, gt, invoker, isNil, not, prop, test } = require('ramda')
const { errorResponse } = require('../lib/utils')
const notNil = compose(not, isNil)
const statusCodeProp = prop('statusCode')
const gt400 = flip(gt)(400)
const statusCodeGt400 = compose(gt400, statusCodeProp)
const statusCodeIs302 = compose(equals(302), statusCodeProp)
const urlContainsErrors = compose(test(/\?error=1/), propPathOr('', ['headers', 'location']))
const extractCookies = flip(invoker(1, 'getCookieString'))

const getCookie = form => Async((reject, resolve) => {
  const jar = request.jar()
  request(
    {
      method: 'POST',
      url: 'https://vba.dse.vic.gov.au/vba/login',
      jar,
      form
    },
    // (error, response, body)
    flip(cond([
      [
        flip(notNil),
        (_, error) => reject(errorResponse(500, {
          code: 'INTERNAL_ERROR',
          message: 'Failure to connect with upstream',
          details: error.message}))],
      [
        statusCodeGt400,
        compose(
          reject,
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
          reject,
          errorResponse(401),
          constant({
            code: 'INTERNAL_ERROR',
            message: 'Login with upstream system failled'
          })
        )
      ],
      [statusCodeIs302, compose(
        resolve,
        extractCookies(jar),
        propPathOr('', ['request', 'href']))]
    ]))
  )
}
)

module.exports = {
  getCookie
}
