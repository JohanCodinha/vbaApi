const request = require('request-promise')
const { Async, map } = require('crocks')
const {
  head,
  compose,
  prop } = require('ramda')

const requestOptionsFormatter = require('./requestOptions.js')
const { parser } = require('../lib/xmlrpcToJson')

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
  map(
    compose(
      head,
      parser,
      prop('body')
    )
  ),
  Async.fromPromise(request),
  requestOptionsFormatter(userDetailsTransaction)
)

module.exports = {
  fetchUserDetails
}
