const { preGet } = require('../actions/pre-get');
const { log, ask } = require("../actions/console");

const chalk = require("chalk")
const { resolve } = require("path");
const fs = require("fs");

const commandExists = require('command-exists');

const { downloadMercurial } = require('../actions/download-mercurial');
const { downloadGit } = require('../actions/download-git');

const get = async (tag, manifestOverride) => {
    const home = require('os').homedir();
    const cache = resolve(home, ".cache");

    const hgExists = await commandExists("hg");
    const gitExists = await commandExists("git");

    try { fs.mkdirSync(resolve(cache, "dot", "mercurial-downloads")) } catch(e) {}

    if(!hgExists) return await downloadMercurial();
    if(!gitExists) return await downloadGit();

    try { fs.mkdirSync(resolve(cache)) } catch(e) {}
    try { fs.mkdirSync(resolve(cache, "dot")) } catch(e) {}

    if(fs.existsSync(resolve(cache, "dot", tag))) return preGet(tag, manifestOverride);

    const trust = await ask(`${chalk.blue.bold("QUESTION")} Do you trust the build script \`${tag} (https://raw.githubusercontent.com/${manifestOverride ? manifestOverride : "dothq/dot"}/master/manifests/${tag}.json)\`? ${chalk.white.bold('[yes/no]')} `);

    if(trust.toLowerCase() == "yes" || trust.toLowerCase() == "y") {
      log("INFO", `Saving trust setting to \`${resolve(cache, "dot", tag)}\`...`)

      return preGet(tag, manifestOverride)
    } else {
      log("INFO", `Exiting...`)
      process.exit(0)
    }
}

module.exports = { get }