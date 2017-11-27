#!/bin/bash -e

get_property() {
  echo $(node -p "p=require('./${1}').${2};")
}

version="$(get_property 'package.json' 'version')"

git remote remove bookshelf-source
git remote add bookshelf-source git@github.com:bookshelf/bookshelf.git

git commit -am "Release $version"
git tag $version

git push bookshelf-source master
git push bookshelf-source master --tags

./scripts/gh-pages
