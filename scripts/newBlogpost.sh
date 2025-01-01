#!/bin/bash

echo "This script will create a new .mustache and .ts file for you"

echo "Please enter the name of the new blog post"

read BLOGPOST

echo "Creating '/blog/${BLOGPOST}'"

# TODO:
# - check if the file already exists
# - ask if you want to overwrite it
# - Add to the database? Publish?

touch dist/js/${BLOGPOST}.js

cp -r src/js/example.ts src/js/${BLOGPOST}.ts
cp -r views/content/example.mustache views/content/${BLOGPOST}.mustache

code src/js/${BLOGPOST}.ts
code views/content/${BLOGPOST}.mustache

# Check if server is running first?
# Check which port it's on...
open http://localhost:3000/blog/${BLOGPOST}

