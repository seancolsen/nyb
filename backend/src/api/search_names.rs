use qubit::handler;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::AppState;

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
pub struct SearchNamesRequest {
    pub text_query: TextQuery,
}

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
pub struct TextQuery {
    pub query: String,
    pub method: SearchMethod,
}

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
pub enum SearchMethod {
    Contains,
    StartsWith,
    RegExp,
}

#[derive(Clone, Deserialize, Serialize, TS)]
#[ts(export)]
pub struct SearchNamesResponse {
    pub names: Vec<NameData>,
}

#[derive(Clone, Deserialize, Serialize, TS)]
#[ts(export)]
pub struct NameData {
    pub name: String,
}

#[handler(query)]
pub async fn search_names(
    state: AppState,
    request: SearchNamesRequest,
) -> Result<SearchNamesResponse, String> {
    let query = match request.text_query.method {
        SearchMethod::Contains => {
            format!(
                "SELECT DISTINCT name FROM name WHERE name LIKE ? ORDER BY name LIMIT 1000"
            )
        }
        SearchMethod::StartsWith => {
            format!(
                "SELECT DISTINCT name FROM name WHERE name LIKE ? ORDER BY name LIMIT 1000"
            )
        }
        SearchMethod::RegExp => {
            format!(
                "SELECT DISTINCT name FROM name WHERE regexp_matches(name, ?) ORDER BY name LIMIT 1000"
            )
        }
    };

    let pattern = match request.text_query.method {
        SearchMethod::Contains => format!("%{}%", request.text_query.query),
        SearchMethod::StartsWith => format!("{}%", request.text_query.query),
        SearchMethod::RegExp => request.text_query.query,
    };

    let db = state.db.lock().unwrap();
    let mut stmt = db.prepare(&query).map_err(|e| e.to_string())?;
    let mut rows = stmt.query([&pattern]).map_err(|e| e.to_string())?;

    let mut names = Vec::new();
    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let name = row.get::<_, String>(0).map_err(|e| e.to_string())?;
        names.push(NameData { name });
    }

    Ok(SearchNamesResponse { names })
}

