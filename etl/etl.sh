#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the repository root (parent of script directory)
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
UNIFIED_FILE="$REPO_ROOT/source-data/unified.csv"

# Create unified.csv if it doesn't exist
if [ ! -f "$UNIFIED_FILE" ]; then
  echo "Creating unified.csv from source data files..."
  # Remove unified.csv if it exists (shouldn't, but just in case)
  rm -f "$UNIFIED_FILE"
  
  # Process each source data file
  for file in "$REPO_ROOT/source-data"/yob*.txt; do
    # Check if file exists (in case no files match the pattern)
    [ ! -f "$file" ] && continue
    
    filename=$(basename "$file")
    year=${filename#yob}
    year=${year%.txt}
    
    # Read each line and prepend the year as the first column
    while IFS= read -r line; do
      # Skip empty lines
      [ -z "$line" ] && continue
      # Prepend year to the line
      echo "$year,$line" >> "$UNIFIED_FILE"
    done < "$file"
  done
  
  echo "Unified CSV file created: $UNIFIED_FILE"
else
  echo "Unified CSV file already exists: $UNIFIED_FILE"
fi

# Run the ETL SQL script
echo "Running ETL SQL script..."
duckdb "$REPO_ROOT/data.duckdb" < "$SCRIPT_DIR/etl.sql"

