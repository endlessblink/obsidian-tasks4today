const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const versionsJson = JSON.parse(fs.readFileSync('versions.json', 'utf8'));

const newVersion = packageJson.version;
manifest.version = newVersion;
versionsJson[newVersion] = manifest.minAppVersion;

fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, '\t'));
fs.writeFileSync('versions.json', JSON.stringify(versionsJson, null, '\t'));