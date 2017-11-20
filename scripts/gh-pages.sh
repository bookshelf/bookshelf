#!/bin/bash -e

# Checkout and update gh-pages branch.
git checkout -B gh-pages bookshelf-source/gh-pages

# Update to master.
git pull bookshelf-source master

# Regenate documentation.
npm run jsdoc

# We must force add because these are usually ignored.
git add --force --all index.html docs

# Commit changes.
git commit -m "Update docs"

# Push the update.
git push bookshelf-source gh-pages
