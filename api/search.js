const { json } = require('paperplane')
const {
  map,
  compose,
  coalesce,
  either,
  liftN,
  runWith,
  flip, alt,
  identity,
  ReaderT,
  Result,
  Async,
  chain,
  isNumber,
  isString,
  isBoolean,
  ap,
  constant
} = require('crocks')
const { evolve, ifElse } = require('ramda')

const { errorResponse, tapLog, toPromise } = require('../lib/utils')
const { verifyJwt } = require('../lib/jwt')
const { extractValidateParams } = require('./extractParams')
const { fetchSpeciesListArea } = require('../upstream/search')

const ReaderResult = ReaderT(Result)

// fetchSpecies :: Result r => r e details -> r e taxonId -> r e latitude -> r e longitude -> r e radius -> r e Async
const fetchSpecies = liftN(5, fetchSpeciesListArea)

// applyToken  :: a -> ReaderT e (Result e b)
const applyToken = data => ReaderResult(
  ({ token }) => ap(token.chain(verifyJwt), Result.of(data))
)

const detailsDefault = coalesce(
  constant('default'),
  ifElse(
    identity,
    constant('detailed'),
    constant('default'))
)

// searchAreaBySpecies :: a -> ReaderT e (Result e b)
const searchAreaBySpecies = () => ReaderResult(
  ({ longitude, latitude, radius, taxonId, details }) =>
    fetchSpecies(detailsDefault(details), alt(taxonId, Result.Ok('')), latitude, longitude, radius)
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
  tapLog,
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
  searchByLocation
}
