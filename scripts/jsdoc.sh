#!/bin/bash -e

static_assets=./.jsdoc-temp

# Clean existing docs
rm -rf ./docs index.html

# Create a temporary folder for static assets.
rm -rf $static_assets
mkdir $static_assets

# Generate static assets.
$(npm bin)/uglifyjs node_modules/knex/build/knex.js > $static_assets/knex.min.js

# Then create the docs.
$(npm bin)/jsdoc --configure ./scripts/jsdoc.config.json

# Now remove temporary folder to clean up.
rm -rf $static_assets
