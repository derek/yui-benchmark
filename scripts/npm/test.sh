#!/bin/sh

./node_modules/.bin/istanbul cover \
	--print both \
	vows -- \
	--spec `ls ./tests/*.js | sort -n`
