#!/bin/bash -e

npm install webpack@1.8.11

webpack=node_modules/.bin/webpack

rm -rf tmp
mkdir tmp

rm -rf build
mkdir build

cp -r lib tmp/lib
cp -r plugins tmp/plugins
cp scripts/promise.js tmp/lib/base/promise.js
cp bookshelf.js tmp

node -p 'p=require("./package");p.main="bookshelf.js";p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > tmp/package.json

$webpack --config scripts/webpack.config.js tmp build/bookshelf.js

uglifyjs node_modules/knex/build/knex.js > docs/assets/knex.min.js
cp node_modules/inflection/inflection.min.js docs/assets/inflection.min.js

rm -rf tmp