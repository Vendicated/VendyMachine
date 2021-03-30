#!/usr/bin/bash
shopt -s globstar

for file in {src,scripts,types}/**/*.ts
do
  if [ -f "$file" ] && ! grep -q Copyright "$file"
  then
    cat assets/licenseHeader.txt "$file" > "$file.licensed" && mv "$file.licensed" "$file"
    git add "$file"
  fi
done
