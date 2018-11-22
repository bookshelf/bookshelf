#!/bin/bash -e
static_assets=.jsdoc-temp

# Clean existing docs
rm -rf ./docs

# Create a temporary folder for static assets.
rm -rf $static_assets
mkdir $static_assets

# Create the docs.
$(npm bin)/jsdoc --configure ./scripts/jsdoc.config.json

# Copy file required for custom GitHub pages domain name
cp CNAME docs/

# Remove temporary folder to clean up.
rm -rf $static_assets
