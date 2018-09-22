const {
  identity,
  mergeDeepRight,
  objOf,
  reduce,
  useWith,
  compose } = require('ramda')

const URL = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'

const options = {
  method: 'POST',
  resolveWithFullResponse: true,
  simple: false,
  url: URL,
  headers: {
    Host: 'vba.dse.vic.gov.au',
    Connection: 'keep-alive',
    'Cache-Control': 'max-age=0',
    Origin: 'https://vba.dse.vic.gov.au',
    'Upgrade-Insecure-Requests': '1'
  },
  form: {
    protocolVersion: '1.0'
  }
}

const buildOptions = (option, transaction, cookie) =>
  reduce(mergeDeepRight, option, [transaction, cookie])

const transactionPath = compose(
  objOf('form'),
  objOf('_transaction')
)

const cookiePath = compose(
  objOf('headers'),
  objOf('Cookie')
)

const requestOptions = useWith(buildOptions, [identity, transactionPath, cookiePath])

module.exports = requestOptions(options)
