#!/bin/bash
git init;
git remote add origin $1; 
git fetch origin;
yogi checkout $2;
