const { prop, constant: K, chain, Result, Maybe, maybeToResult, compose, map, isDefined, tap, flip, curry, identity, propPath, alt} = require('crocks')
const { mergeAll, objOf, converge, unapply, liftN, ifElse, length, call, curryN, concat } = require('ramda')

// num -> [m {}] -> m {}
const liftMergeAll = flip(liftN)(unapply(mergeAll))
const mergeAllAdt = (...args) => liftMergeAll(args.length)(...args)

const getPropOrMissingError = param =>
  maybeToResult(
    missingPropError(param),
    getProp(param)
  )

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

const missingPropError = param =>
  [{
    parameter: param,
    code: 'MISSING_PARAMETER',
    message: `Missing required parameter: ${param}`

  }]

const invalidPropError = param =>
  [{
    parameter: param,
    code: 'INVALID_PARAMETER',
    message: `Invalid required parameter: ${param}`
  }]

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
const extractParams = (requiredParams, params = []) =>
  converge(
    mergeAllAdt,
    concat(
      requiredParams.map(getRequiredObjOfProp),
      params.map(getObjOfProp)
    )
  )

// extractValidateParams :: { key: predicate } -> Request -> { key: Result }
const extractValidateParams = spec => converge(
  unapply(mergeAll),
  Object.entries(spec).map(
    ([param, pred]) => compose(
      objOf(param),
      chain(
        ifElse(
          pred,
          Result.Ok,
          K(Result.Err(invalidPropError(param))
          )
        )
      ),
      getPropOrMissingError(param)
    )
  )
)

module.exports = {
  extractValidateParams,
  extractParams,
  getPropFromKeys
}
