const { compose } = require('crocks')
const { fetch } = require('./request')

const transaction = (sortMethod, taxonId, lat, long, rad) =>
`<transaction xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
  <operations xsi:type="xsd:List">
    <elem xsi:type="xsd:Object">
      <criteria xsi:type="xsd:Object">
        <timestamp>${Date.now()}</timestamp>
        <sortMethod>${sortMethod ? 'detailed' : 'default'}</sortMethod>
        <taxonId>${taxonId}</taxonId>
        <speciesSize>66</speciesSize>
        <areaType>8</areaType>
        <areaName>${long},${lat}@${rad}</areaName>
      </criteria>
      <operationConfig xsi:type="xsd:Object">
        <dataSource>TaxonInfoView_DS</dataSource>
        <operationType>fetch</operationType>
        <textMatchStyle>exact</textMatchStyle>
      </operationConfig>
      <startRow xsi:type="xsd:long">0</startRow>
      <endRow xsi:type="xsd:long">1000</endRow>
      <componentId>isc_ListGridWithFooter_0</componentId>
      <appID>builtinApplication</appID>
      <operation>fetchSpeciesListAreaReport</operation>
    </elem>
  </operations>
  </transaction>`

module.exports = {
  fetchSpeciesListArea: compose(
    fetch,
    transaction
  )
}
