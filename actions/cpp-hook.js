const { resolve } = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const { spawn } = require("child_process");

const { runShell } = require("./run-shell")
const { log } = require("./console");

const runCppHook = async (target, location) => {
    const { type, name, http, repository } = target;
    
    const runner = type == "mercurial" ? "hg" : type;
    
    const isWindows = require("os").platform == "win32"
    
    if(fs.existsSync(resolve(resolve(__dirname, "../bin"), "dot-get.out"))) { await rimraf.sync(`${resolve(__dirname, "../bin")}/dot-get.${isWindows ? "exe" : "out"}`) }
    
    runShell(`g++ -o ${resolve(__dirname, "../bin")}/dot-get.${isWindows ? "exe" : "out"} ${resolve(__dirname, "../bin")}/get.cpp`).then(r => {
        
        log("INFO", `Running \`dot-get.${isWindows ? "exe" : "out"}\` binary...`)
        log("INFO", `Cloning \`base (${name})\`...`)
        spawn(`${resolve(__dirname, "../bin")}/dot-get.${isWindows ? "exe" : "out"}`, [runner, http, location, repository.branch], { stdio: 'inherit' });
    })
}

module.exports = { runCppHook }