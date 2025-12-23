pub mod api;
pub mod constants;

pub use api::*;

use frozen_duckdb::Connection;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
}
