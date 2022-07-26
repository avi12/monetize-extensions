#!/usr/bin/env node
const fflate = require('fflate');
const yargs = require('yargs');
const { argv } = yargs(pricess.argv[1]);
const fs = require('fs');

const data = fflate.unzipSync(fs.createReadStream(argv.zipName));
console.log(data);