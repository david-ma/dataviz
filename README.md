# Dataviz Sandbox

Hello World!

This is [David Ma](https://twitter.com/frostickle)'s Data Visualisation Sandbox. A place for experimenting with html, javascript and css ...and typescript, mustache templates, nodejs, open auth, git hooks, apis, twitter cards, facebook open graph and everything else you "need to know" to develop for the modern web.

---
## Quickstart

```
npm install
npm run start
```

---

I'm finally updating this read me because I need to keep track of a certain git hook that I've added. And apparently git hooks are not version controlled on purpose.

I'm adding this to git hooks:

`#!/bin/sh`

`git describe --all --long > config/git-commit-version.txt`

Saving it under `.git/hooks/post-commit` and also `.git/hooks/post-checkout`, so that we get something like `heads/master-0-g171616a` whenever we checkout or save some code. This is useful for cache busting. I'm going to pass the git hash to require.mustache (which has the config stuff for requirejs). Don't forget to chmod 755 the scripts so that they can be executed.
