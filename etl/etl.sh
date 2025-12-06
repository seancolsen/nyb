#!/bin/bash

duckdb ../data.duckdb < init.sql

# Iterate over all yob*.txt files in source-data directory
for file in ../source-data/yob*.txt; do
  # Extract year from filename (e.g., yob1880.txt -> 1880)
  filename=$(basename "$file")
  year=${filename#yob}  # Remove "yob" prefix
  year=${year%.txt}      # Remove ".txt" suffix
  
  # Insert data from file into the import table, adding the year column
  duckdb ../data.duckdb <<EOF
INSERT INTO import (year, name, gender, count)
SELECT $year, name, gender, count
FROM read_csv('$file', header=false, columns={'name': 'VARCHAR', 'gender': 'VARCHAR', 'count': 'INTEGER'});
EOF
done






