#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');

const fs = require("fs");
const http = require('isomorphic-git/http/node')
const path = require("path");
const axios = require('axios');

const git = require('isomorphic-git')
const hg = require("hg");

program.version('1.0.0');

const log = (chan, pl) => {
    const channels = {
        ERROR: chalk.red.bold,
        WARN: chalk.yellow.bold,
        INFO: chalk.blue.bold,
        SUCCESS: chalk.green.bold
    }

    console.log(`${channels[chan](chan)}`, pl)
}

const gitRegex = /[a-z]+\/[a-z]+/;
const hostRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;

const fancyTime = (duration) => {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

program
  .command('fetch <hgProject> <gitProject>')
  .description('fetch a project')
  .action((hgProject, gitProject, sw) => {
    if(!hgProject.startsWith("http") || !hgProject.startsWith("https")) hgProject = `https://` + hgProject;

    const repo = hgProject.split("://")[1].split("/");
    repo.shift()

    const projectName = repo.join("/").split("/").pop();

    if(!gitProject.startsWith("http") || !gitProject.startsWith("https")) gitProject = `https://` + gitProject;

    const gitRepo = gitProject.split("://")[1].split("/");
    gitRepo.shift()

    log("INFO", `Fetching \`${repo.join("/")}\` information from mercurial host \`${hgProject.split("://")[1].split("/").shift()}\`.`)

    const dir = path.join(process.cwd(), projectName)

    log("INFO", `Starting clone of mercurial repository \`${repo.join("/")}\` located at \`${hgProject.split("://")[1].split("/").shift()}\`, this may take a while...`)

    const t = Date.now();

    var int = setInterval(() => {
      console.log("\n")
      log("INFO", `[${fancyTime(Date.now() - t)}] Tig is still cloning...\n`)
    }, 5000)

    var failed = false;

    hg.clone(hgProject, dir, (e, out) => {
      if(e) {
        failed = true;

        log("ERROR", e.message)
        console.log(e.stack.replace("Error: " + e.message, ""), "\n")

        return clearInterval(int)
      }

      if(!failed && out) {
        log("SUCCESS", `Cloned mercurial repository \`${repo.join("/")}\` in \`${fancyTime(Date.now() - t)}s\``)
        return clearInterval(int)
      }
    });

  });

program.parse(process.argv)