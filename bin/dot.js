#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');

const fs = require("fs");
const http = require('isomorphic-git/http/node')
const path = require("path");
const axios = require('axios');

const commandExists = require('command-exists').sync;

const git = require('isomorphic-git')
const hg = require("hg");
const { exec } = require('child_process');

program.version('1.0.0');

const log = (chan, pl, upPrev, nl) => {
    const channels = {
        ERROR: chalk.red.bold,
        WARN: chalk.yellow.bold,
        INFO: chalk.blue.bold,
        SUCCESS: chalk.green.bold,
        PROCESS: chalk.magenta.bold,
        HELPER: chalk.cyan.bold
    }

    if(upPrev) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${channels[chan](chan)} ` + pl);
    } else {
      console.log(`${nl ? "\n" : ""}${channels[chan](chan)}`, pl) 
    }
}

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

const runShell = (cmd) => {
  const exec = require('child_process').exec;

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }

      resolve(stdout ? stdout : stderr);
    });
  });
}

program
  .command('get <tag>')
  .description('get a project by its tag name')
  .action((tag) => {


  });

program
  .command('tags [manifestOverride]')
  .description('lists all tags')
  .action((manifestOverride) => {
    log("INFO", `Fetching manifests from \`https://api.github.com/repos/${manifestOverride ? manifestOverride : "dothq/dot"}/contents/manifests\`.`)

    axios.get(`https://api.github.com/repos/${manifestOverride ? manifestOverride : "dothq/dot"}/contents/manifests`)
      .then(res => {
        console.log(res.json)
      }).catch(e => {
        log("ERROR", `Failed ${JSON.stringify(e.response.data)}.`)
        if(e.response.data.message == "Not Found") {
          log("ERROR", "You could try adding a manifest override argument to |dot tags|.")
        }
      })
  });

program.parse(process.argv);