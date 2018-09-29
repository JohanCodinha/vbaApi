const request = require('request-promise')
const { Async, prop, maybeToAsync, map, chain, resultToAsync } = require('crocks')
const {
  head,
  compose } = require('ramda')

const { errorResponse } = require('../lib/utils')
const requestOptionsFormatter = require('./requestOptions.js')
const { parser } = require('../lib/xmlrpcToJson')
const parse = compose(
  resultToAsync,
  map(head),
  parser
)

const userDetailsTransaction = `
<transaction xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
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

const fetchUserDetails = compose(
  chain(parse),
  chain(
    compose(
      maybeToAsync(errorResponse(400)),
      prop('body')
    )
  ),
  Async.fromPromise(request),
  requestOptionsFormatter(userDetailsTransaction)
)

module.exports = {
  fetchUserDetails
}
