#!/bin/sh

./node_modules/.bin/jshint \
 	--config ./node_modules/yui-lint/jshint.json \
	./bin/*.js \
	./lib/app/*.js \
	./lib/assets/*.js