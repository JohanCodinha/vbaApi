const { json } = require('paperplane')
const {
  map,
  propPath, resultToAsync, compose, maybeToResult,
  liftN,
  runWith,
  curry, flip, alt, Maybe,
  bimap,
  identity,
  ReaderT,
  Result,
  Async,
  chain,
  safe,
  isNumber,
  tap,
  either,
  ap,
  concat,
} = require('crocks')
const { converge, evolve, mergeAll, nAry, unapply, objOf, is } = require('ramda')

const { errorResponse, tapLog, toPromise } = require('../lib/utils')
const { verifyJwt } = require('../lib/jwt')
const { extractParams } = require('./extractParams')
const { fetchSpeciesListArea } = require('../upstream/search')
const ReaderResult = ReaderT(Result)

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
// fetchSpecies :: Result r => r e details -> r e taxonId -> r e latitude -> r e longitude -> r e radius -> r e Async
const fetchSpecies = liftN(5, fetchSpeciesListArea)

// applyToken  :: a -> ReaderT e (Result e b)
const applyToken = data => ReaderResult(
  ({ token }) => ap(token, Result.of(data))
)

// searchAreaBySpecies :: a -> ReaderT e (Result e b)
const searchAreaBySpecies = () => ReaderResult(
  ({ longitude, latitude, radius, taxonId, details }) => fetchSpecies(details, taxonId, latitude, longitude, radius)
)

// Monad m => ReaderT e (m a) -> m e a
const runReader = reader => flip(runWith, reader())

// searchAreaBySpeciesFlow :: { key: maybe } -> Either e Async( e data )
const searchAreaBySpeciesFlow = compose(
  chain(applyToken),
  chain(searchAreaBySpecies),
  ReaderResult.of
)
// const e = either(identity, identity)
const searchByLocation = compose(
  toPromise,
  map(json),
  // Async
  either(compose(Async.Rejected, errorResponse(400)), identity),
  tapLog,
  // Result e Async
  chain(runReader(searchAreaBySpeciesFlow)),
  tapLog,
  // Result e { key: Maybe }
  map(evolve(
    {
      token: compose(
        chain(verifyJwt),
        maybeToResult('')
      ),
      longitude: validParam('longitude', isNumber),
      latitude: validParam('latitude', isNumber),
      radius: validParam('radius', isNumber),
      taxonId: compose(
        alt(Result.Ok('')),
        validParam('taxonId', isNumber)
      ),
      details: compose(
        map(x => x ? 'detailed' : 'default'),
        // Maybe a -> Result e a
        validParam('details', is(Boolean)),
        // Default to false
        alt(Maybe.Just(false))
      )
    }
  )),
  tapLog,
  bimap(errorResponse(400), identity),
  // Result e { key: Maybe }
  extractParams(['token'], ['radius', 'longitude', 'latitude', 'taxonId', 'details'])
)

module.exports = {
  searchByLocation,
}
