#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');

const fs = require("fs");
const http = require('isomorphic-git/http/node')
const path = require("path");
const axios = require('axios');
const readline = require("readline");

const commandExists = require('command-exists').sync;

const git = require('isomorphic-git')
const hg = require("hg");
const { exec } = require('child_process');
const { resolve } = require('path');

program.version('1.0.0');

const rlInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

const downloadManifest = (repo, name) => {
  return new Promise((resolve, reject) => {
    axios.get(`https://raw.githubusercontent.com/${repo ? repo : "dothq/dot"}/master/manifests/${name}.json`)
      .then(res => resolve(res.data))
  })
}

const ask = (q) => {
  return new Promise((resolve, reject) => {
    rlInterface.question(q, (a) => {
      rlInterface.close();
      resolve(a)
    });
  })
}

const setup = async (tag, manifestOverride) => {
  const home = require('os').homedir();
  const cache = resolve(home, ".cache");

  if(!fs.existsSync(resolve(cache, "dot", tag))) {
    log("PROCESS", `Downloading \`${tag}\` manifest...`)

    manifest = await downloadManifest(manifestOverride, tag);

    log("SUCCESS", `Downloaded \`${tag}\` manifest.`)

    manifest.trusted = true;

    fs.writeFileSync(resolve(cache, "dot", tag), JSON.stringify(manifest, 2), "utf-8")
  } else {
    manifest = JSON.parse(fs.readFileSync(resolve(cache, "dot", tag)))
  }

  const { name, id, author, targets } = manifest;

  if(!name || !id || !author || !builder || !targets || !targets.base || !targets.patch) { 
    log("ERROR", `Failed to load build script \`${tag}\`. It seems to be malformed.`)
    process.exit(-1)
  }

  log("INFO", `Setting up \`${name} (${id})\` by \`${author}\`.`)

  log("INFO", `Cloning \`base (${targets.base.name})\``)

  fs.mkdirSync(resolve(__dirname, tag));
}

program
  .command('get <tag> [manifestOverride]')
  .description('get a project by its tag name')
  .action(async (tag, manifestOverride) => {
    const home = require('os').homedir();
    const cache = resolve(home, ".cache");

    try { fs.mkdirSync(resolve(cache)) } catch(e) {}
    try { fs.mkdirSync(resolve(cache, "dot")) } catch(e) {}

    if(fs.existsSync(resolve(cache, "dot", tag))) return setup(tag, manifestOverride);

    const trust = await ask(`${chalk.blue.bold("QUESTION")} Do you trust the build script \`${tag}\`? ${chalk.white.bold('[yes/no]')} `);

    if(trust.toLowerCase() == "yes" || trust.toLowerCase() == "y") {
      log("INFO", `Saving trust setting to \`${resolve(cache, "dot", tag)}\`...`)

      return setup(tag, manifestOverride)
    } else {
      log("INFO", `Exiting...`)
      process.exit(0)
    }

  });

program
  .command('tags [manifestOverride]')
  .description('lists all tags')
  .action((manifestOverride) => {
    var t = Date.now();

    log("INFO", `Fetching manifests from \`https://api.github.com/repos/${manifestOverride ? manifestOverride : "dothq/dot"}/contents/manifests\`...`, true)

    axios.get(`https://api.github.com/repos/${manifestOverride ? manifestOverride : "dothq/dot"}/contents/manifests`)
      .then(res => {
        log("INFO", `Loaded \`${res.data.length}\` manifest${res.data.length == 1 ? "" : "s"} in \`${Date.now() - t}ms\``, true, true)


        console.log("\n\n  Available manifests")

        res.data.forEach(manifest => {
          console.log(`   - ${manifest.name.split(".")[0]}`)
        })

        console.log("")
      }).catch(e => {
        if(!e.response) return console.error("\n" + e)

        log("ERROR", `Failed ${JSON.stringify(e.response.data)}.`, true)
        if(e.response.data.message == "Not Found") {
          log("ERROR", "You could try adding a manifest override argument to |dot tags|.", false, true)
        }
      })
  });

program.parse(process.argv);