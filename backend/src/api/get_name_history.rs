use qubit::handler;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::AppState;
use crate::constants::{MIN_YEAR, NUM_YEARS};

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
pub struct GetNameHistoryRequest {
    pub name: String,
}

#[derive(Clone, Deserialize, Serialize, TS)]
#[ts(export)]
pub struct NameHistoryData {
    pub count_both: Vec<u64>,
    pub count_f: Vec<u64>,
    pub count_m: Vec<u64>,
    pub dense_rank_both: Vec<u64>,
    pub dense_rank_f: Vec<u64>,
    pub dense_rank_m: Vec<u64>,
    pub popularity_both: Vec<f64>,
    pub popularity_f: Vec<f64>,
    pub popularity_m: Vec<f64>,
}

#[handler(query)]
pub async fn get_name_history(
    state: AppState,
    request: GetNameHistoryRequest,
) -> Result<NameHistoryData, String> {
    let query = r#"
        SELECT
          year,
          count_both,
          count_f,
          count_m,
          dense_rank_both,
          dense_rank_f,
          dense_rank_m,
          popularity_both,
          popularity_f,
          popularity_m
        FROM name_year
        JOIN name on name.id = name_year.name
        WHERE name.name = ?
        ORDER BY year
    "#;

    let db = state.db.lock().unwrap();
    let mut stmt = db.prepare(query).unwrap();
    let mut rows = stmt.query([&request.name]).unwrap();
    let mut name_found = false;
    let mut result = NameHistoryData {
        count_both: vec![0; NUM_YEARS],
        count_f: vec![0; NUM_YEARS],
        count_m: vec![0; NUM_YEARS],
        dense_rank_both: vec![0; NUM_YEARS],
        dense_rank_f: vec![0; NUM_YEARS],
        dense_rank_m: vec![0; NUM_YEARS],
        popularity_both: vec![0.0; NUM_YEARS],
        popularity_f: vec![0.0; NUM_YEARS],
        popularity_m: vec![0.0; NUM_YEARS],
    };

    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
        name_found = true;
        let year = row.get::<_, i32>(0).map_err(|e| e.to_string())?;
        let index: usize = (year as usize).saturating_sub(MIN_YEAR);

        result.count_both[index] = row.get::<_, u64>(1).map_err(|e| e.to_string())?;
        result.count_f[index] = row.get::<_, u64>(2).map_err(|e| e.to_string())?;
        result.count_m[index] = row.get::<_, u64>(3).map_err(|e| e.to_string())?;
        result.dense_rank_both[index] = row.get::<_, u64>(4).map_err(|e| e.to_string())?;
        result.dense_rank_f[index] = row.get::<_, u64>(5).map_err(|e| e.to_string())?;
        result.dense_rank_m[index] = row.get::<_, u64>(6).map_err(|e| e.to_string())?;
        result.popularity_both[index] = row.get::<_, f64>(7).map_err(|e| e.to_string())?;
        result.popularity_f[index] = row.get::<_, f64>(8).map_err(|e| e.to_string())?;
        result.popularity_m[index] = row.get::<_, f64>(9).map_err(|e| e.to_string())?;
    }

    if name_found {
        Ok(result)
    } else {
        Err("Name not found".to_owned())
    }
}
