use qubit::server::Router as QubitRouter;
use std::path::PathBuf;

// Import the handler from the main crate
use nyb_server::get_name_history;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create qubit router with the same handlers as the main app
    let qubit_router = QubitRouter::new().handler(get_name_history);

    // Determine the output directory (shared_types relative to project root)
    // This binary runs from backend/, so we need to go up one level
    let output_dir = PathBuf::from("..").join("shared_types");

    // Generate TypeScript bindings and write to directory
    qubit_router.write_bindings_to_dir(&output_dir);

    println!(
        "TypeScript bindings generated successfully in: {}",
        output_dir.display()
    );

    Ok(())
}
