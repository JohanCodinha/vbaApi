const { prop, Result, Maybe, maybeToResult, compose, map, isDefined, tap, flip, curry, identity, propPath, alt} = require('crocks')
const { mergeAll, objOf, converge, unapply, liftN, ifElse, length, call, concat } = require('ramda')

// num -> [m {}] -> m {}
const liftMergeAll = flip(liftN)(unapply(mergeAll))
const mergeAllAdt = (...args) => liftMergeAll(args.length)(...args)

// string -> Object -> Result { string: param }
const getRequiredObjOfProp = param =>
  maybeToResult(
    [{
      parameter: param,
      code: 'INVALID_PARAMETER',
      message: `Missing required parameter: ${param}`
    }],
    compose(
      map(x => objOf(param, Maybe.Just(x))),
      getProp(param)
    )
  )

// [string] -> string -> {} -> Maybe prop
const getPropFromKeys = curry(
  (paramKeys, prop, data) => paramKeys
    .map(key => propPath([key, prop])(data))
    .reduce(flip(alt), Maybe.zero())
)

const getProp = getPropFromKeys([ 'body', 'query', 'params' ])

// string -> Object -> Ok { string: prop }
const getObjOfProp = param => data => Result.Ok({ [param]: getProp(param, data) })

// [string] -> [string] -> {} -> Result [{key: Maybe}]
const extractParams = curry((requiredParams, params) =>
  converge(
    mergeAllAdt,
    concat(
      requiredParams.map(getRequiredObjOfProp),
      params.map(getObjOfProp)
    )
  )
)

module.exports = {
  extractParams,
  getPropFromKeys
}
