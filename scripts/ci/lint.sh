#!/bin/sh

SRC_DIR=${SRC_DIR:-.}
LINT_OUTPUT_DIR=${LINT_OUTPUT_DIR:-tmp}

cd ${SRC_DIR}

./node_modules/.bin/jshint \
 	--config ./node_modules/yui-lint/jshint.json \
	./bin/*.js \
	./lib/app/*.js \
	./lib/assets/*.js \
	./bad-lint.js \
	| sed -e 's/^/<pre>/g' \
	| sed -e 's/$/<\/pre>/g' \
	> ${LINT_OUTPUT_DIR}/jslint.html