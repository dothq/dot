const runShell = (cmd) => {
    const exec = require('child_process').exec;
  
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          if(error.includes("Permission denied")) return console.log("Try running the command as root or as Administrator.")
          console.error(error);
        }
  
        resolve(stdout ? stdout : stderr);
      });
    });
}

module.exports = { runShell }