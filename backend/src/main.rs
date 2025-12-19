mod api;

use axum::Router;
use clap::Parser;
use frozen_duckdb::Connection;
use qubit::server::Router as QubitRouter;
use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener as TokioTcpListener;
use tracing_subscriber::{EnvFilter, fmt};

use api::get_name;

#[derive(Parser)]
#[command(name = "nyb-server")]
struct Args {
    /// Path to the DuckDB database file
    db_path: String,
    /// Port to listen on (default: 3000, will increment if port is taken)
    #[arg(long, default_value = "3000")]
    port: u16,
}

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
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
    // Enable structured logging with file/line info; default to verbose qubit/jsonrpsee
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,jsonrpsee=trace,qubit=trace"));
    fmt()
        .with_env_filter(filter)
        .with_span_events(fmt::format::FmtSpan::FULL)
        .with_file(true)
        .with_line_number(true)
        .init();

    let args = Args::parse();

    // Connect to DuckDB
    let db = Connection::open(&args.db_path)?;
    let state = AppState {
        db: Arc::new(Mutex::new(db)),
    };

    // Find available port
    let port = find_available_port(args.port);

    // Create qubit router
    let qubit_router = QubitRouter::new().handler(get_name);

    // Convert qubit router to Axum service
    let (qubit_service, _qubit_handle) = qubit_router.to_service(state);

    // Create Axum router
    let app = Router::new().nest_service("/api", qubit_service);

    // Start the server
    let listener = TokioTcpListener::bind(format!("127.0.0.1:{}", port)).await?;
    let url = format!("http://localhost:{}", port);
    println!("Server listening on {}", url);

    axum::serve(listener, app).await?;

    Ok(())
}
