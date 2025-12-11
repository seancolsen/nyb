use axum::Router;
use clap::Parser;
use qubit::handler;
use frozen_duckdb::Database;
use qubit::server::Router as QubitRouter;
use serde::{Deserialize, Serialize};
use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener as TokioTcpListener;
use ts_rs::TS;

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
struct AppState {
    db: Arc<Mutex<Database>>,
}

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
struct GetNameRequest {
    name: String,
}

#[derive(Clone, Serialize, TS)]
#[ts(export)]
struct GetNameResponse {
    result: Option<i64>,
}

#[handler(query)]
async fn get_name(state: AppState, request: GetNameRequest) -> GetNameResponse {
    let query = r#"
        SELECT max(count_both)
        FROM name_year
        JOIN name on name.id = name_year.name
        WHERE name.name = ?
    "#;

    let db = state.db.lock().unwrap();
    let mut stmt = match db.prepare(query) {
        Ok(stmt) => stmt,
        Err(_) => return GetNameResponse { result: None },
    };

    let result: Option<i64> = stmt
        .query_row([&request.name], |row| Ok(row.get(0)?))
        .ok();

    GetNameResponse { result }
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
    let db = Database::open(&args.db_path)?;
    let state = AppState {
        db: Arc::new(Mutex::new(db)),
    };

    // Find available port
    let port = find_available_port(args.port);

    // Create qubit router
    let qubit_router = QubitRouter::new()
        .handler(get_name);

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