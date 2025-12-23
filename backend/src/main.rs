use axum::Router;
use clap::Parser;
use frozen_duckdb::Connection;
use qubit::server::Router as QubitRouter;
use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener as TokioTcpListener;
use tower_http::cors::CorsLayer;

use nyb_server::{AppState, get_name_history};

#[derive(Parser)]
#[command(name = "nyb-server")]
struct Args {
    /// Path to the DuckDB database file
    db_path: String,
    /// Port to listen on (default: 3000, will increment if port is taken)
    #[arg(long, default_value = "3000")]
    port: u16,
}

fn find_available_port(start_port: u16) -> u16 {
    let mut port = start_port;
    loop {
        if TcpListener::bind(("127.0.0.1", port)).is_ok() {
            return port;
        }
        port += 1;
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();

    // Connect to DuckDB
    let db = Connection::open(&args.db_path)?;
    let state = AppState {
        db: Arc::new(Mutex::new(db)),
    };

    // Find available port
    let port = find_available_port(args.port);

    // Create qubit router
    let qubit_router = QubitRouter::new().handler(get_name_history);

    // Convert qubit router to Axum service
    let (qubit_service, _qubit_handle) = qubit_router.to_service(state);

    // Create Axum router with CORS
    let app = Router::new()
        .nest_service("/api", qubit_service)
        .layer(CorsLayer::permissive());

    // Start the server
    let listener = TokioTcpListener::bind(format!("127.0.0.1:{}", port)).await?;
    let url = format!("http://localhost:{}", port);
    println!("Server listening on {}", url);

    axum::serve(listener, app).await?;

    Ok(())
}
