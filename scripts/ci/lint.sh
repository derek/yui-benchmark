# #!/bin/sh
# SRC_DIR=${SRC_DIR:-.}
# LINT_OUTPUT_DIR=${LINT_OUTPUT_DIR:-tmp}
# cd ${SRC_DIR}

jshint --config ./node_modules/yui-lint/jshint.json ./lib/app/*.js ./lib/cli/*.js