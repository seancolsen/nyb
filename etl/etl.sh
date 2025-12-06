#!/bin/bash

duckdb ../data.duckdb < init.sql

for file in ../source-data/yob*.txt; do
  filename=$(basename "$file")
  year=${filename#yob}
  year=${year%.txt}
  duckdb ../data.duckdb <<-EOF
    INSERT INTO import (year, name, gender, count)
    SELECT $year, name, gender, count
    FROM read_csv(
      '$file',
      header=false,
      columns={name: 'TEXT', gender: 'TEXT', count: 'INTEGER'}
    );
	EOF
done






