# Shared Types

This directory contains TypeScript bindings generated from the Rust backend using [Qubit](https://github.com/andogq/qubit).

## Files

- `bindings.ts` - Auto-generated TypeScript types and client code for the backend API. Do not edit manually.

## Regenerating Types

To regenerate the TypeScript bindings after making changes to backend API handlers:

```bash
./shared_types/generate_types.sh
```

Or from the backend directory:

```bash
cargo run --bin generate_types
```

The generated code will be written to `bindings.ts` in this directory.

## How It Works

The type generation process:

1. Creates a Qubit router with all registered API handlers (same as the main server)
2. Uses Qubit's `write_bindings_to_dir()` method to generate TypeScript bindings
3. Writes the output to `shared_types/bindings.ts`

The generation binary is located at `backend/src/bin/generate_types.rs` and is separate from the main application binary.
