use std::collections::HashMap;

use duckdb::ToSql;
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
    let mut query = String::with_capacity(1000);
    let mut query_param_count: u8 = 0;
    let mut query_params = HashMap::<String, Box<dyn ToSql>>::new();
    let mut set_query_param = |value: Box<dyn ToSql>| -> String {
        let prefixed_key = format!("$p{}", query_param_count);
        let raw_key = format!("p{}", query_param_count);
        query_params.insert(raw_key, value);
        query_param_count += 1;
        prefixed_key
    };

    query.push_str("SELECT name FROM name WHERE ");

    match request.text_query.method {
        SearchMethod::Contains => {
            let p = set_query_param(Box::new(format!("%{}%", request.text_query.query)));
            query.push_str(&format!("name ILIKE {}", p));
        }
        SearchMethod::StartsWith => {
            let p = set_query_param(Box::new(format!("{}%", request.text_query.query)));
            query.push_str(&format!("name ILIKE {}", p));
        }
        SearchMethod::RegExp => {
            let p = set_query_param(Box::new(request.text_query.query.clone()));
            query.push_str(&format!("regexp_matches(name, {}, 'i')", p));
        }
    }

    let db = state.db.lock().unwrap();
    let mut stmt = db.prepare(&query).map_err(|e| e.to_string())?;

    let mut flat_params = Vec::<&dyn ToSql>::new();
    for i in 1..=stmt.parameter_count() {
        let param_name = stmt
            .parameter_name(i)
            .map_err(|e| format!("Failed to get parameter name at index {}: {}", i, e))?;
        let param_value = query_params
            .get(&param_name)
            .ok_or_else(|| format!("Parameter {} not found in query_params", param_name))?;
        flat_params.push(param_value as &dyn ToSql);
    }
    let mut rows = stmt
        .query(flat_params.as_slice())
        .map_err(|e| e.to_string())?;

    let mut names = Vec::new();
    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let name = row.get::<_, String>(0).map_err(|e| e.to_string())?;
        names.push(NameData { name });
    }

    Ok(SearchNamesResponse { names })
}
