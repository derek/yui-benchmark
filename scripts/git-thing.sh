#!/bin/bash
git init;
git remote add origin $1; 
git fetch origin $2; 
git reset --hard FETCH_HEAD;