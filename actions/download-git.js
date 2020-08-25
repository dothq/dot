const { log } = require("./console")

const downloadGit = async () => {
    log("ERROR", `Git is required to use \`dot\`. Please find out how to download it for your OS at https://git-scm.com/downloads`, false, true)
    console.log()

    process.exit(-1)
}

module.exports = { downloadGit }