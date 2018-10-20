const { constant: K, chain, Result, Maybe, maybeToResult, compose, flip, curry, propPath, alt } = require('crocks')
const { mergeAll, objOf, converge, unapply, ifElse } = require('ramda')

const getPropOrMissingError = param =>
  maybeToResult(
    missingPropError(param),
    getProp(param)
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
  getPropFromKeys
}
