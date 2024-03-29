const { exec } = require("child_process");

const http = require('http')
const fs = require("fs")
var createHandler = require('github-webhook-handler')


function fatalError(string) {
  console.log()
  console.warn("\x1b[31m"+ string +"\x1b[0m")
  console.log()
  process.exit()
}

var config;

if (fs.existsSync("./config.json")) {
  config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
}
else {
  fatalError("No config file found, exiting!")
}

if (!config.secret || !config.repos) {
  fatalError("Config file missing secret or repos!")
}

var handler = createHandler({ path: '/', secret: config.secret })

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(3001, ()=>{
  console.log("Listening for push events on: ", Object.keys(config.repos).join(", "))
})

handler.on('error', function (err) {
  console.error('Rejected POST:', err.message)
})

handler.on('push', function (event) {
  console.log(event.payload.repository.full_name, "PULL")
  if (config.repos[event.payload.repository.full_name] && !config.devMode) {
    exec(config.repos[event.payload.repository.full_name].command)
    console.log(config.repos[event.payload.repository.full_name].command, "executed")
  }
  else {
    console.log(`Error: Repo auth valid, but repo "${event.payload.repository.full_name}" not in config!`)
  }
})
