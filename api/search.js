const { json } = require('paperplane')
const {
  map,
  propPath, resultToAsync, compose, maybeToResult,
  liftN,
  curry, flip, alt, Maybe,
  bimap,
  identity
} = require('crocks')
const { converge, mergeAll, nAry, unapply, objOf } = require('ramda')

const { errorResponse, tapLog, toPromise } = require('../lib/utils')
const { verifyJwt } = require('../lib/jwt')

const getKeyProp = paramKeys => prop => data => paramKeys
  .map(key => propPath([key, prop])(data))
  .reduce(flip(alt), Maybe.zero())

const getParam = parameter =>
  maybeToResult(
    [{
      parameter,
      code: 'INVALID_PARAMETER',
      message: `Missing required parameter: ${parameter}`
    }],
    compose(
      map(objOf(parameter)),
      getKeyProp([ 'body', 'query', 'params' ])(parameter)
    )
  )

// params => req => object
const getRequiredParams = paramNames => converge(
  liftN(paramNames.length, unapply(mergeAll)),
  paramNames.map(getParam)
)

const searchByLocation = compose(
  toPromise,
  resultToAsync,
  map(json),
  // map(verifyJwt),
  // propPath(['body', 'token'])
  bimap(errorResponse(400), identity),
  tapLog,
  converge((...args) => liftN(args.length, unapply(mergeAll))(...args),
    [
      ...['radius', 'fifou', 'nope'].map(param =>
        maybeToResult([{message: 'missing non required params'}],
          compose(
            map(objOf(param)),
            getKeyProp([ 'body', 'query', 'params' ])(param)
          )
        )),
        getRequiredParams(['token', 'longitude' ])
    ])
)
module.exports = {
  searchByLocation,
  getParams: curry(getRequiredParams)
}
