#!/bin/sh

./node_modules/.bin/istanbul cover \
	--print both \
	./node_modules/vows/bin/vows -- \
	--spec `ls ./tests/*.js | sort -n`
