use qubit::handler;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::AppState;

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
pub struct GetNameRequest {
    pub name: String,
}

#[derive(Clone, Serialize, TS)]
#[ts(export)]
pub struct GetNameResponse {
    pub result: Option<i64>,
}

#[handler(query)]
pub async fn get_name(state: AppState, request: GetNameRequest) -> GetNameResponse {
    let query = r#"
        SELECT max(count_both)
        FROM name_year
        JOIN name on name.id = name_year.name
        WHERE name.name = ?
    "#;

    let db = state.db.lock().unwrap();
    let mut stmt = db.prepare(query).unwrap();

    let result: Option<i64> = stmt.query_row([&request.name], |row| Ok(row.get(0)?)).ok();

    GetNameResponse { result }
}

