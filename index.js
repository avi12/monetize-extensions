#!/usr/bin/env node
const fflate = require('fflate');
const yargs = require('yargs');
const { argv } = yargs(process.argv.slice(2));
const fs = require('fs');

const data = fflate.unzipSync(fs.readFileSync(argv.zipName));
console.log(data);