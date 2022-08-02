#!/usr/bin/env node
const fflate = require('fflate');
const yargs = require('yargs');
const { argv } = yargs(process.argv.slice(2));
const fs = require('fs');
const path = require('path');

function getStorage(pathDirMonetization) {
  return fs.readdirSync(pathDirMonetization).reduce(
    (files, pathFile) => ({
      ...files,
      [`build/${pathDirMonetization}/${pathFile}`]: fs.readFileSync(
        `${pathDirMonetization}/${pathFile}`
      ),
    }),
    {}
  );
}

if (!argv.zipName) {
  throw new Error('Supply --zip-name');
}

if (!argv.manifestFilenameInput) {
  throw new Error('Supply --manifest-filename-input');
}

if (!argv.pathMonetization) {
  throw new Error(
    'Supply --path-monetization to the monetization scripts directory'
  );
}

const { version } = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'package.json')).toString()
);
const zipName = argv.zipName.replace('{version}', version);
const zipData = fflate.unzipSync(fs.readFileSync(zipName));

const manifestData = JSON.parse(
  new TextDecoder().decode(zipData['manifest.json'])
);
const manifestInput = JSON.parse(
  fs.readFileSync(argv.manifestFilenameInput).toString()
);

for (const key in manifestInput) {
  if (Array.isArray(manifestData[key])) {
    if (key === 'content_scripts') {
      manifestData[key].push(manifestInput[key]);
      continue;
    }
    manifestData[key] = [
      ...new Set([...manifestData[key], ...manifestInput[key]]),
    ];
    continue;
  }
  if (key === 'background' && !manifestData[key]) {
    manifestData[key] = manifestInput[key];
  }
}

zipData['manifest.json'] = Buffer.from(JSON.stringify(manifestData, null, 2));

const monetization = getStorage(argv.pathMonetization);

const zip = fflate.zipSync({
  ...zipData,
  monetization,
});

const zipNameOutput = zipName.replace('.zip', '__adapted_for_chrome.zip');
fs.writeFileSync(zipNameOutput, zip);

console.log('Created', zipNameOutput);
