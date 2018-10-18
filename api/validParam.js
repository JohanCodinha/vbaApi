const { curry, maybeToResult, chain, safe } = require('crocks')

// validParam :: string -> pred -> Result( [err] { key: Maybe} )
const validParam = curry((name, pred) =>
  maybeToResult(
    [{
      parameter: name,
      code: 'INVALID_PARAMETER',
      message: `Invalid parameter: ${name}`
    }],
    chain(safe(pred))
  )
)

module.exports = { validParam }
