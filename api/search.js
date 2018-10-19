const { json } = require('paperplane')
const {
  map,
  compose, maybeToResult,
  coalesce,
  either,
  liftN,
  runWith,
  flip, alt, Maybe,
  bimap,
  identity,
  ReaderT,
  Result,
  Async,
  chain,
  isNumber,
  isString,
  isBoolean,
  tap,
  ap,
  constant
} = require('crocks')
const { evolve, is, ifElse } = require('ramda')

const { errorResponse, tapLog, toPromise } = require('../lib/utils')
const { verifyJwt } = require('../lib/jwt')
const {
  extractParams,
  extractValidateParams } = require('./extractParams')
// const { validParam } = require('./validParam')
const { fetchSpeciesListArea } = require('../upstream/search')
const ReaderResult = ReaderT(Result)

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
  // Result e Async
  runReader(searchAreaBySpeciesFlow),
  // Result e { key: Result }
  map(evolve(
    {
      token: chain(verifyJwt),
      taxonId: alt(Result.Ok('')),
      details: coalesce(
        constant('default'),
        ifElse(
          identity,
          constant('detailed'),
          constant('default'))
      )
    }
  )),
  // Result e { key: Result }
  extractValidateParams({
    token: isString,
    longitude: isNumber,
    latitude: isNumber,
    radius: isNumber,
    taxonId: isNumber,
    details: isBoolean
  })
)

module.exports = {
  searchByLocation,
}
