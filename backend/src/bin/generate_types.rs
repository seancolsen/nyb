use std::path::PathBuf;

use nyb_server::create_router;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let qubit_router = create_router();
    let output_dir = PathBuf::from("..")
        .join("frontend")
        .join("src")
        .join("api_types");
    qubit_router.write_bindings_to_dir(&output_dir);
    println!(
        "TypeScript bindings generated successfully in: {}",
        output_dir.display()
    );
    Ok(())
}
