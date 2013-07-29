# #!/bin/sh
SRC_DIR=${SRC_DIR:-.}
LINT_OUTPUT_DIR=${LINT_OUTPUT_DIR:-tmp}

cd ${SRC_DIR}

./node_modules/.bin/jshint \
 	--config ./node_modules/yui-lint/jshint.json \
	./lib/app/*.js \
	./bin/*.js \
	./lib/assets/*.js > ${LINT_OUTPUT_DIR}/jslint.html