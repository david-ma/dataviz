#!/bin/sh

# Quick update dataviz:
# git clean, git pull, pnpm install, pnpm run build

ssh -t pi4 "docker exec -u root -it dataviz-web-1 sh -c 'cd /usr/app/Thalia/websites/dataviz && git clean -f && git pull https://github.com/david-ma/dataviz.git && pnpm install && pnpm run build'"
