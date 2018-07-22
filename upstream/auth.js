const request = require('request')
const { Async, propPathOr } = require('crocks')
const { compose, cond, equals, flip, gt, invoker, isNil, not, prop, test } = require('ramda')
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
      [(_, rej) => notNil(rej), reject],
      [statusCodeGt400,
        compose(
          reject,
          (code) => new Error(`Upstream system returned error code: ${code}`),
          prop('statusCode')
        )
      ],
      [urlContainsErrors, () => reject(new Error('Login with upstream system failled'))],
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
