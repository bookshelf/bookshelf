#!/bin/bash -e

get_property() {
  echo $(node -p "p=require('./${1}').${2};")
}

echo "Getting version number from package.json"
version="$(get_property 'package.json' 'version')"

echo "(Re)Creating bookshelf-source remote"
git remote remove bookshelf-source
git remote add bookshelf-source git@github.com:bookshelf/bookshelf.git

echo "Committing new release version w/ any outstanding changes"
git commit -am "Release $version"

echo "Tagging version w/ number"
git tag $version

echo "Pushing commit to source master"
git push bookshelf-source master

echo "Pushing new version tag to source master"
git push bookshelf-source master --tags

echo "Running gh-pages publish"
./scripts/gh-pages
