const PORT = 4000

const SALT_ROUNDS = 10

import bcrypt from "bcrypt"
import express from "express"
import fs from "fs"
import { exec } from "child_process"
import read from "read"
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks"

const DEFAULT_CONFIG = {
  apiEnabled: false,
  webUiEnabled: false,
  maxRepoHistory: "unlimited",
  webhookRootPath: "/webhooks",
  port: 8113
}

const CFG = {
  API_ENABLED: "apiEnabled",
  WEB_UI_ENABLED: "webUiEnabled",
  MAX_REPO_HISTORY: "maxRepoHistory",
  HASHED_PASSWORD: "hashedPassword",
  REQUIRE_PASSWORD: "requirePassword",
  DEFAULT_SECRET: "defaultSecret",
  SHELL: "shell",
  REPOS: "repos",
  PORT: "port"
}

const REPO_CFG = {
  SECRET: "secret",
  COMMAND: "command",
  WEBHOOK_PATH: "webhookPath"
}


let config = {}

function getConfig(property) {
  return config[property] ?? DEFAULT_CONFIG[property]
}

function isConfigSet(property) {
  return config[property] !== undefined
}

if (fs.existsSync("config.json")) {
  config = JSON.parse(fs.readFileSync("config.json"))
} else {
  fatalError("You need to set up a config.json file first! Check config.json.sample for an example.")
}

function fatalError(message) {
  console.error(message)
  process.exit(1)
}

function info(...message) {
  console.info(...message)
}


function getPasswordInput() {
  return new Promise((res, rej)=>{
    read({prompt: "Enter a Password:", silent: true}, (error, response)=>{
      if (error) rej(error)
      else res(response)
    })
  })
}

function warn(...message) {
  console.warn("[WARNING]:", ...message)
}

function saveConfig() {
  fs.writeFileSync("config.json", JSON.stringify(config, null, 4))
}

const args = process.argv.slice(2)
if (args[0] === "password") {
  const password = await getPasswordInput()
  config[CFG.REQUIRE_PASSWORD] = true
  config[CFG.HASHED_PASSWORD] = bcrypt.hashSync(password, SALT_ROUNDS)
  saveConfig()
  process.exit()
}

if (args[0] === "check")

if (args.length !== 0) {
  fatalError(`Unknown command "${args[0]}!"`)
}

// Config validitiy checks
if (!isConfigSet(CFG.REQUIRE_PASSWORD)) {
  if (isConfigSet(CFG.HASHED_PASSWORD)) {
    warn("requirePassword is not set, but a password is provided, so defaulting to password enabled.")
  } else {
    fatalError("No password is set in the config, run 'npm run password' to set one up! If you want to disable the password, set requirePassword to false in the config.")
  }
} 
if (isConfigSet(CFG.REQUIRE_PASSWORD) && !isConfigSet(CFG.HASHED_PASSWORD)) {
  fatalError("A password is required, but has not been provided in the config! Run 'npm run password' to set one up.")
}
if (!isConfigSet(CFG.REPOS) || getConfig(CFG.REPOS).length === 0) {
  warn("You don't have any repos set up in config, so this tool will not do anything.")
} else {
  checkRepos(config)
}

function checkRepos({defaultSecret, repos}) {
  const hasDefaultSecret = defaultSecret !== undefined
  const repoEntries = Object.entries(repos)
  let encounteredError = false
  repoEntries.forEach(([repo, properties])=>{
    if (properties.secret === undefined && !hasDefaultSecret) {
      console.error(`Repo "${repo}" does not have a secret specified and no default is provided.`)
    }
    if (properties.command === undefined) {
      console.error(`Repo "${repo}" does not have a command provided.`)
    }
  })
  if (encounteredError) {
    fatalError("Quitting due to one or more invalid repo configs!")
  }
  info(`Loaded ${repoEntries.length} repositories successfully!`)
}

let history = {}

if (getConfig(CFG.MAX_REPO_HISTORY) > 0) {
  if (fs.existsSync("history.json")) {
    history = JSON.parse(fs.readFileSync("history.json"))
  } else {
    info("No history file found, so one will be generated")
  }
}

if (isConfigSet(CFG.REPOS) && getConfig(CFG.MAX_REPO_HISTORY) > 0) {
  Object.keys(config.repos).forEach(repo=>{
    if (history[repo] === "undefined") {
      history[repo] = {
        runs: [],
        receivedEvent: false
      }
    }
  })
}

function generateMiddleware(repos) {
  const middleware = []
  Object.entries(repos).forEach(([repo, properties])=>{
    if (properties.secret !== undefined) {
      
    }
  })

  if (isConfigSet(CFG.DEFAULT_SECRET)) {

  }
}

const server = express()

// server.use(createNodeMiddleware())

if (getConfig(CFG.WEB_UI_ENABLED)) {
  server.use(express.static("static"))
}

server.use((req, res, next)=>{
  if (getConfig(CFG.WEB_UI_ENABLED)) {
    res.status(404)
    res.send("404: Page not found");
  } else {
    next()
  }
})

server.get("/")

server.listen(getConfig(CFG.PORT), ()=>{
  console.log(`Listening on port ${getConfig(CFG.PORT)}...`)
})