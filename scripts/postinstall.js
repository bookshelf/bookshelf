#!/usr/bin/env node
var child_process = require('child_process');
var Promise = require('bluebird');
var isWin = /^win/.test(process.platform);

// This script is only needed to simplify package.json `postinstall` script. 
//
// !!! THIS SCRIPT SHOULD BE REMOVED AFTER 2016-12-31 WHEN NODE v0.10.x and !!!
// !!! v0.12.x MAINTANANCE WILL END                                         !!!
//
// After 2016-12-31 change `package.json` `scripts.postinstall` entry to:
//
//   "postinstall": "node ./scripts/build.js lib \"npm run build\"",
//

// Promisify child_process spawn

var spawn = function (cmd, args) {
  return new Promise(function(resolve, reject) {
    var child, spawn = child_process.spawn;

    // Execute command for Windows
    if (isWin) child = spawn('cmd.exe', ['/c', cmd].concat(args), {cwd: process.cwd(), stdio: 'inherit'});
    // Execute command for other operating systems
    else child = spawn(cmd, args , {cwd: process.cwd(), stdio: 'inherit'});

    // Pass stdout and stderr
    // Handle result
    child.on('exit', function (code) {
      if (code) reject(code);
      else resolve();
    });
    child.on('error', reject);
  });
} 

// Process `postinstall`

Promise.try(function () {
  // This is required only for non-production env
  if (process.env.NODE_ENV !== 'production') {
    // Install babel-eslint ^2.13.0 instead of ^3.5.0 for Node v0.10 and v0.12
    return spawn('npm', ['run', 'install-engine-dependencies']);
  }
}).then(function () {
  // Run ./scripts/build.js that will compile `lib` folder if its currently not present
  return spawn('node', ['./scripts/build.js', 'lib', 'npm run build']);
}).catch(function (err) {
  console.error(err);
  process.exit(1);
});
