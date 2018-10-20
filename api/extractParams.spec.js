const test = require('tape')
const {
  extractParams,
  getPropFromKeys,
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

// const e = extractParams
// const extract =
//   either(identity, identity)
// 
// test('extractParams with params present in the req', function (t) {
//   const params = ['longitude', 'latitude', 'radius', 'detail', 'taxonId']
//   const required = ['token']
//   const result = e(required, params)(req)
//   const resultParamsList = Object.entries(extract(result))
// 
//   t.ok(isSameType(result, Result), 'extractParams return a Result')
//   t.ok(isObject(extract(result)), 'extractParams return an Object')
// 
//   t.ok(
//     resultParamsList
//       .map(last)
//       .every(isSameType(Maybe)),
//     'all keys are Maybes')
// 
//   t.ok(
//     params.concat(required)
//       .every(x => contains(x, resultParamsList.map(head))),
//     'all requested params have keys in response Object')
// 
//   t.end()
// })
// 
// test('extractParams with missing required param from req', function (t) {
//   const params = ['longitude', 'latitude', 'radius', 'detail', 'taxonId']
//   const required = ['token']
//   const reqOmitToken = map(req, omit(['token']))
// 
//   t.ok(isSameType(e(required, params)(reqOmitToken), Result), 'extractParams return a Result')
//   t.ok(isArray(extract(e(required, params)(reqOmitToken))), 'extractParams return an Array')
//   t.ok(
//     extract(e(required, params)(reqOmitToken))
//       .every(isObject),
//     'result return a list of Error object')
//   t.equal(
//     extract(e([...required, 'password'], params)(reqOmitToken)).length,
//     2,
//     'result return  two error object')
//   t.end()
// })
// 
// test('extractParams with missing params from req', function (t) {
//   const params = ['longitude', 'latitude', 'radius', 'detail', 'taxonId']
//   const required = ['token']
//   const reqOmit = omits => map(omit(omits))
//   const omited = ['longitude', 'detail']
//   const data = reqOmit(omited)(req)
//   t.ok(isSameType(e(required, params)(data), Result), 'extractParams return a Result')
//   t.ok(isObject(extract(e(required, params)(data))), 'extractParams return an Object')
//   t.ok(
//     Object.entries(extract(e(required, params)(data)))
//       .map(last)
//       .every(isObject),
//     'result return a list of object')
//   t.equal(
//     extract(e(required, params)(data))[omited[0]].inspect(),
//     'Nothing',
//     'missing prop return Nothing')
//   t.end()
// })
// 

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
