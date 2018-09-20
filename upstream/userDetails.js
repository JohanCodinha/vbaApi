const request = require('request-promise')
const { Async, map } = require('crocks')
const {
  head,
  compose,
  identity,
  mergeDeepRight,
  objOf,
  prop,
  reduce,
  useWith } = require('ramda')
const { parser } = require('../lib/xmlrpcToJson')
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
const userDetailsTransaction =
`<transaction
    xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
    <operations xsi:type="xsd:List">
      <elem xsi:type="xsd:Object">
        <criteria xsi:type="xsd:Object"></criteria>
        <operationConfig xsi:type="xsd:Object">
          <dataSource>UserSessionDetail_DS</dataSource>
          <operationType>fetch</operationType>
        </operationConfig>
        <appID>builtinApplication</appID>
        <operation>UserSessionDetail_DS_fetch</operation>
      </elem>
    </operations>
  </transaction>`
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

const getUserDetails = compose(
  map(
    compose(
      head,
      parser,
      prop('body')
    )
  ),
  Async.fromPromise(request),
  requestOptions(options, userDetailsTransaction)
)

module.exports = {
  getUserDetails
}
