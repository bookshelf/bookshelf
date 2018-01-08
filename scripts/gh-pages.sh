#!/bin/bash -e

echo "Fetch branches from source"
git fetch bookshelf-source

echo "Checkout gh-pages branch from source"
git checkout -B gh-pages bookshelf-source/gh-pages

echo "Pulling latest master branch"
git pull bookshelf-source master

echo "Regenerating documentation"
npm run jsdoc

echo "Add all docs to repo"
git add --force --all index.html docs

echo "Commit docs changes"
git commit -m "Update docs"

echo "Push to gh-pages branch on github repo"
git push bookshelf-source gh-pages

echo "Re-checkout master"
git checkout master
