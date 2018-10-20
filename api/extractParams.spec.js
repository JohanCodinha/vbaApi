const test = require('tape')
const {
  extractValidateParams
} = require('./extractParams.js')
const { contains, head, last, omit, map } = require('ramda')
const { Result, Maybe, isSameType, isNumber, isObject, isArray, isString, either, identity } = require('crocks')

const req = {
  body: {
    longitude: 123123313,
    latitude: 312313213,
    radius: 500,
    detail: true,
    taxonId: 1234
  },
  params: {
    token: '123123.reqweqwe.ewqe123',
    password: 'nope'
  },
  query: {
    search: true
  }
}

test('extractValidateParams return an Object of Result', function (t) {
  const params = extractValidateParams({ radius: isNumber, token: isString })(req)
  console.log(params)
  t.ok(isSameType(params.radius, Result), 'radius return a Result')
  t.ok(isSameType(params.token, Result), 'token return a Result')

  const radiusParams = extractValidateParams({ radius: isNumber })(req)
  t.ok(isSameType(radiusParams.radius, Result), 'radius return a Result')

  const passwordParams = extractValidateParams({ password: isNumber })(req)
  t.ok(isSameType(passwordParams.password, Result), 'password return a Result')
  t.end()
})
