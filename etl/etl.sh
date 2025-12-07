#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the repository root (parent of script directory)
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

duckdb "$REPO_ROOT/data.duckdb" < "$SCRIPT_DIR/init.sql"

for file in "$REPO_ROOT/source-data"/yob*.txt; do
  filename=$(basename "$file")
  year=${filename#yob}
  year=${year%.txt}
  duckdb "$REPO_ROOT/data.duckdb" <<-EOF
    INSERT INTO import (year, name, gender, count)
    SELECT $year, name, gender, count
    FROM read_csv(
      '$file',
      header=false,
      columns={name: 'TEXT', gender: 'TEXT', count: 'INTEGER'}
    );
	EOF
done

duckdb "$REPO_ROOT/data.duckdb" < "$SCRIPT_DIR/etl.sql"
