const request = require('request-promise-native')
const { Async, constant, propPathOr } = require('crocks')
const { head, split, join, nAry, concat, converge, map, both, either, and, compose, curry, cond, complement, propSatisfies, isEmpty,
  or, equals, flip, gt, identity, mergeDeepLeft, prop, test } = require('ramda')
const { errorResponse, tapLog } = require('../lib/utils')
const statusCodeProp = prop('statusCode')
const gt400 = flip(gt)(400)
const statusCodeGt400 = compose(gt400, statusCodeProp)
const statusCodeIs = code => compose(equals(code), statusCodeProp)
const urlContainsErrors = compose(test(/\?error=1/), propPathOr('', ['headers', 'location']))
// const extractCookies = flip(invoker(1, 'getCookieString'))
const { Rejected, Resolved } = Async
const mergeTwoDeep = curry(nAry(2, mergeDeepLeft))
const getCookie = form =>
  Async.fromPromise(url => {
    const jar = request.jar()
    return request(
      {
        method: 'POST',
        url,
        timeout: 5000,
        jar,
        form,
        simple: false,
        resolveWithFullResponse: true
      })
      .then(x => (console.log(x.headers), x))
      // .then(x => {console.log(x.headers['set-cookie'], jar.getCookieString(url)) 
      //   mergeTwoDeep({ cookieString: jar.getCookieString(url) })(x)})
  })('https://vba.dse.vic.gov.au/vba/login')
    .bimap(errorHandling, identity)
    .chain(responseHandling)

const errorHandling = error =>
{
  return errorResponse(500, {
    code: 'INTERNAL_ERROR',
    message: 'Failure to connect with upstream',
    details: error.message,
    codeErr: error})
}

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
      //either(
        urlContainsErrors,
        //propSatisfies(isEmpty, 'cookieString')
      //),
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
      both(
        statusCodeIs(302),
        //propSatisfies(complement(isEmpty), 'cookieString')
      ),
      compose(
        Resolved,
        join('; '),
        map(
          compose(
            head,
            split(';')
          )
        ),
        prop('set-cookie'),
        prop('headers')
      )
    ],
    [
      (x) => {
        console.log(x)
        debugger;
      },
      compose(Rejected)
    ]
  ])

module.exports = {
  getCookie
}
