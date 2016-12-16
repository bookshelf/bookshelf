#!/bin/bash -e

static_assets=./.jsdoc-temp

# Clean existing docs
rm -rf ./docs index.html

# Create a temporary folder for static assets.
rm -rf $static_assets
mkdir $static_assets

# Then create the docs.
$(npm bin)/jsdoc --configure ./scripts/jsdoc.config.json

# Now remove temporary folder to clean up.
rm -rf $static_assets
