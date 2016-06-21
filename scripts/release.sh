#!/bin/bash -e

# Update master to the latest
git checkout master
git pull

get_property() {
  echo $(node -p "p=require('./${1}').${2};")
}

delete_property() {
  echo "$(node -p "p=require('./${1}');delete p.${2};JSON.stringify(p, null, 2)")" > $1
  echo "deleted '${2}' from './${1}'"
}

update_version() {
  echo "$(set_property ${1} 'version' "'${2}'")"
  echo "Updated ${1} version to ${2}"
}

# Remove the postinstall script, because we're going to build everything here.
current_version="$(get_property 'package.json' 'version')"

printf "Next version (current is $current_version)? "
read next_version

if ! [[ $next_version =~ ^[0-9]\.[0-9]+\.[0-9](-.+)? ]]; then
  echo "Version must be a valid semver string, e.g. 1.0.2 or 2.3.0-beta.1"
  exit 1
fi

# Update version in package.json before updating `release` branch.
update_version 'package.json' $next_version
git commit -am "Update version to $next_version."

# Switch to `release` branch (create it if it doesn't exist) and update it to latest
git checkout -B release
git pull

# Get current state from `master` branch
git merge -Xtheirs master

# Now clean up those force added files, we'll have to add another commit.
# First remove all files in the repo (including those ignored files that we
# force added).
echo "$(git rm -r --cached .)"

# Now add all files, this will exclude ignored files.
echo "$(git add .)"

# Delete all ignored files and folders
echo "$(git clean -xdf)"

# Build JS from ES6 and generate JSDoc
npm run build
npm run jsdoc

# We must force add because these are usually ignored.
git add --force --all index.html docs lib

# Remove the postinstall script because we'll be including the built files in
# this commit.
delete_property 'package.json' 'scripts.postinstall'

npm test

git commit -am "Release $next_version."
git tag $next_version

echo "# Publishing docs"

echo "$(git checkout -B gh-pages)"
echo "$(git pull)"
echo "$(git merge -Xtheirs release)"
echo "$(git checkout master)"

# All good. Push changes to remote.
git push origin master
git push origin release
git push origin release --tags
git push origin gh-pages

npm publish
