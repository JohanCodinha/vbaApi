const request = require('request')
const { Async, constant, propPathOr } = require('crocks')
const { flip, cond, compose, concat, converge, curry, identity, lensProp, merge, mergeAll, mergeDeepRight, objOf, over, pair, prop, reduce, useWith,} = require('ramda')
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
const buildOptions = (option, cookie, transaction) =>
  reduce(mergeDeepRight, option, [cookie, transaction])

const buildTransaction = compose(
  objOf('form'),
  objOf('_transaction')
)
const buildCookie = compose(
  objOf('headers'),
  objOf('Cookie')
)

const requestOptions = useWith(buildOptions, [identity, buildCookie, buildTransaction])

const getUserDetails = cookie => Async((reject, resolve) => {
  // console.log(cookie)
  const opts = requestOptions(options, cookie, userDetailsTransaction)
  console.log(opts)
  return request(
    opts,
    cond([
      [
        notNil,
        reject(errorResponse(500, {
          code: 'INTERNAL_ERROR',
          message: 'Failure to connect with upstream',
          details: error.message}))

      ],
      [
        flip(statusCodeGt400),
        compose(
          reject,
          errorResponse(500),
          (code) => ({
            code: 'INTERNAL_ERROR',
            message: `Upstream system returned error code: ${code}`
          }),
          prop('statusCode'),
          flip
        )
      ],
      [flip(statusCodeIs302), compose(
        resolve,
        flip
      )
      ]
    ]))
})

// vbaClient.userDetails = function userDetails (cookie) {
//   const options = Object.assign({}, vbaClient.options);
//   options.headers.Cookie = cookie;
//   options.form._transaction = `<transaction
//     xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
//     <operations xsi:type="xsd:List">
//       <elem xsi:type="xsd:Object">
//         <criteria xsi:type="xsd:Object"></criteria>
//         <operationConfig xsi:type="xsd:Object">
//           <dataSource>UserSessionDetail_DS</dataSource>
//           <operationType>fetch</operationType>
//         </operationConfig>
//         <appID>builtinApplication</appID>
//         <operation>UserSessionDetail_DS_fetch</operation>
//       </elem>
//     </operations>
//   </transaction>`;
//   return rp(options)
//     .then(response => vbaClient.parse(response.body))
//     .catch(error => console.log(error));
// }

module.exports = {
  getUserDetails
}
