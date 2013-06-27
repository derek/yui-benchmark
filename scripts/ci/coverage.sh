#!/bin/sh

SRC_DIR=${SRC_DIR:-.}
COVERAGE_DIR=${COVERAGE_DIR:-tmp}
TEST_RESULTS_DIR=${TEST_RESULTS_DIR:-tmp}

cd ${SRC_DIR}
mkdir -p ${COVERAGE_DIR}
mkdir -p ${TEST_RESULTS_DIR}

./node_modules/.bin/istanbul cover \
    --dir ${COVERAGE_DIR} \
    --print none ./node_modules/.bin/vows \
    -- --xunit `ls ./tests/*.js | sort -n` | grep ^\< \
    > ${TEST_RESULTS_DIR}/results.xml
