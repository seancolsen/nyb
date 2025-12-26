use axum::Router;
use axum::http::Method;
use clap::Parser;
use duckdb::{AccessMode, Config, Connection};
use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener as TokioTcpListener;
use tower_http::cors::{Any, CorsLayer};

use nyb_server::{AppState, create_router};

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
    let config = Config::default().access_mode(AccessMode::ReadOnly)?;
    let db = Connection::open_with_flags(&args.db_path, config)?;
    db.set_prepared_statement_cache_capacity(1024);
    let state = AppState {
        db: Arc::new(Mutex::new(db)),
    };

    let port = find_available_port(args.port);
    let qubit_router = create_router();
    let (qubit_service, _qubit_handle) = qubit_router.to_service(state);
    let app = Router::new().nest_service("/api", qubit_service).layer(
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
            .allow_headers(Any)
            .max_age(std::time::Duration::from_secs(3600)),
    );
    let listener = TokioTcpListener::bind(format!("127.0.0.1:{}", port)).await?;
    let url = format!("http://localhost:{}", port);
    println!("Server listening on {}", url);

    axum::serve(listener, app).await?;

    Ok(())
}
