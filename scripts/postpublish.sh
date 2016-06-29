#!/bin/bash -e

get_property() {
  echo $(node -p "p=require('./${1}').${2};")
}

version="$(get_property 'package.json' 'version')"

git commit -am "Release $version"
git tag $version

git push origin master
git push origin master --tags

npm run gh-pages
