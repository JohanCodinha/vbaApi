const http = require('http')

const app = require('./main.js')

const port = process.env.PORT || 3001

const listening = err =>
  err
    ? console.error(err)
    : console.info(`Listening on port: ${port}`)

http.createServer(app).listen(port, listening)
