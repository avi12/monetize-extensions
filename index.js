#!/usr/bin/env node
const fflate = require('fflate');
const yargs = require('yargs');
const { argv } = yargs(process.argv.slice(2));
const fs = require('fs');
const getStorage = require('key-file-getStorage');

if (!argv.zipName) {
  throw new Error('Supply --zip-name');
}

if (!argv.manifestFilenameInput) {
  throw new Error('Supply --manifest-filename-input');
}

const zipName = argv.zipName.replace('{version}', manifestData.version);
const zipData = fflate.unzipSync(fs.readFileSync(zipName), {
  filter: (file) => file.name === 'manifest.json',
});

const manifestData = JSON.parse(data['manifest.json'].toString());
const manifestInput = JSON.parse(
  fs.readFileSync(argv.manifestFilenameInput).toString()
);

for (const key in manifestInput) {
  manifestData[key] = { ...manifestData[key], ...manifestInput[key] };
  if (Array.isArray(manifestData[key])) {
    manifestData[key] = [...new Set(manifestData[key])];
  }
}

const zip = fflate.zipSync({
  ...zipData,
  monetization: getStorage(argv.pathMonetization),
});

const zipName = argv.zipName.replace('.zip', '-chrome.zip');
fs.writeFileSync(zipName, zip);

console.log('Created', zipName);
