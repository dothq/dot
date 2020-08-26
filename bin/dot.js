#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');

const { get } = require('../commands/get');
const { log } = require("../actions/console");

program.version('1.0.0');

program
	.command('get <tag> [manifestOverride]')
	.description('get a project by its tag name')
	.action(async (tag, manifestOverride) => get(tag, manifestOverride));

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

				process.exit(0);
			}).catch(e => {
				if(!e.response) return console.error("\n" + e)

				log("ERROR", `Failed ${JSON.stringify(e.response.data)}.`, true)
				if(e.response.data.message == "Not Found") {
					log("ERROR", "You could try adding a manifest override argument to |dot tags|.", false, true)
				}
			})
	});

program.parse(process.argv);