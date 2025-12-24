pub mod api;
pub mod constants;
pub mod router;

pub use api::*;
pub use router::create_router;

use frozen_duckdb::Connection;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
}
