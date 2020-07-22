#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');

const fs = require("fs");
const path = require("path");

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

program
  .command('build [destination]')
  .description('build chromium to the specified destination')
  .action((destination) => {
    if(!fs.existsSync(path.resolve(process.cwd(), "buildtools"))) return log("ERROR", "The folder `./buildtools` could not be resolved.")
    if(!destination) log("WARN", "Output missing, defaulting to `out/Default`.")
  });

program.parse(process.argv)