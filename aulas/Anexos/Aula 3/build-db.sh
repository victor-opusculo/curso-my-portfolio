#!/bin/sh
rm ./uploads/media/*
touch ./uploads/media/.gitkeep

rm ./my-portfolio.sqlite3
sqlite3 ./my-portfolio.sqlite3 < ./my-portfolio.sql