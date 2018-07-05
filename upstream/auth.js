const { lt } = require('ramda')
const axios = require('axios')

const fetchGuestCookie = () => axios
  .post('https://vba.dse.vic.gov.au/vba/login', {
    body: 'guest=2&enter=Guest%3A+I+Agree',
    validateStatus: lt(400)
  })

module.exports = {
  fetchGuestCookie
}
