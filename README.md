# Name Your Baby

This is the repository for [nameyourbaby.com](https://nameyourbaby.com), an app that helps you explore names.

## Data

- The data USA-specific and is sourced from the [Social Security Administration](https://www.ssa.gov/oact/babynames/index.html). Updated annually.

## Architecture

- DuckDB for data storage and querying.
- Rust + [Axum](https://github.com/tokio-rs/axum) for the backend.
- [Qubit](https://github.com/andogq/qubit) for the API layer.
- React + Tailwind for front end. (See [ui](./ui) for the front end code.)
