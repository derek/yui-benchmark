#!/bin/bash
git init;
git remote add origin $1; 
git fetch origin;
git merge $2 -m "Merge";
rm -rf build
yogi build;
