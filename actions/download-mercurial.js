const axios = require("axios")
const { log } = require("./console")
const path = require("path")
const ProgressBar = require('progress')
const fs = require("fs")
const https = require("https");
const chalk = require("chalk")
const { runShell } = require("./run-shell")

const downloadMercurial = async () => {
    log("ERROR", `Mercurial is required to use \`dot\`. We will attempt to install this for you.`, false, true)

    return new Promise(async (resolve) => {
        axios.get("https://www.mercurial-scm.org/sources.js")
            .then(async res => {
                const data = res.data.replace("sources = [", `{ "results": [ `).replace("]]", "]]}")

                let r = JSON.parse(data).results;
                let downloads = []

                r.forEach(i => {
                    downloads.push({
                        version: i[0],
                        os: i[1],
                        url: i[2],
                        name: i[3]
                    })
                })

                let os = require("os").platform == "win32" ? "x64 Windows" : require("os").platform == "darwin" ? "DMG - macOS" : "linux"; 

                if(os == "linux") {
                    log("WARN", `Due to the huge amount of distributions of Linux we cannot provide downloads of Mercurial for every distro. You can find out how to download Mercurial on your machine by looking up "mercurial" on your package manager.`, false, true)
                    log("INFO", `  If your Linux distro is on the list below, you can run the command provided.`, false, true)
                    log("INFO", `   Download Mercurial on:`)
                    log("INFO", `      * ${chalk.bold("Ubuntu, Debian and friends")} - sudo apt-get install mercurial`)
                    log("INFO", `      * ${chalk.bold("Arch Linux")} - sudo pacman -S mercurial`)
                    log("INFO", `      * ${chalk.bold("CentOS and Fedora")} - yum install mercurial`)
                    console.log()
                    process.exit(-1);
                } else {
                    const download = downloads.filter(d => d.name.includes(os))[0]

                    await downloadMercurialFile(download.url)
                }
            })
    })
}

const downloadMercurialFile = async (location) => {
    const home = require('os').homedir();
    const cache = path.resolve(home, ".cache");

    return new Promise(async (resolve) => {
        var req = https.request({
            host: 'www.mercurial-scm.org',
            port: 443,
            path: location.split("www.mercurial-scm.org")[1]
          });
           
        req.on('response', function(res){
            var len = parseInt(res.headers['content-length'], 10);
           
            var bar = new ProgressBar(`${chalk.blue.bold("INFO")} Downloading Mercurial (${location.split("/")[location.split("/").length-1]}) [:bar] :percent :etas`, {
              complete: '=',
              incomplete: ' ',
              width: 40,
              total: len
            });
           
            res.on('data', function (chunk) {
              bar.tick(chunk.length);
            });
           
            res.on('end', function () {
              log("INFO", `Installing Mercurial (${location.split("/")[location.split("/").length-1]})...`)

              const out = path.resolve(cache, "dot", "mercurial-downloads", location.split("/")[location.split("/").length-1]);

              runShell(out)
            });

            res.pipe(fs.createWriteStream(path.resolve(cache, "dot", "mercurial-downloads", location.split("/")[location.split("/").length-1])))
        });
           
        req.end();
    })
}

module.exports = { downloadMercurial }