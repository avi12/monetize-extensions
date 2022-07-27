#!/usr/bin/env node
const fflate = require('fflate');
const yargs = require('yargs');
const { argv } = yargs(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const getStorage = require('key-file-storage');

if (!argv.zipName) {
  throw new Error('Supply --zip-name');
}

if (!argv.manifestFilenameInput) {
  throw new Error('Supply --manifest-filename-input');
}

const packagePath = path.resolve(__dirname, 'package.json');
console.log(packagePath);
const packageJson = JSON.parse(fs.readFileSync(packagePath).toString());
const zipName = argv.zipName.replace('{version}', packageJson.version);
const zipData = fflate.unzipSync(fs.readFileSync(zipName), {
  filter: (file) => file.name === 'manifest.json',
});

const manifestData = JSON.parse(zipData['manifest.json'].toString());
const manifestInput = JSON.parse(
  fs.readFileSync(argv.manifestFilenameInput).toString()
);

for (const key in manifestInput) {
  if (Array.isArray(manifestData[key])) {
    manifestData[key] = [
      ...new Set({ ...manifestData[key], ...manifestInput[key] }),
    ];
    continue;
  }
  if (key === 'background' && !manifestData[key]) {
    manifestData[key] = manifestInput[key];
  }
}

const zip = fflate.zipSync({
  ...zipData,
  monetization: getStorage(argv.pathMonetization),
});

const zipNameOutput = zipName.replace('.zip', '-chrome.zip');
fs.writeFileSync(zipNameOutput, zip);

console.log('Created', zipName);
