use qubit::handler;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::AppState;

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
pub struct GetNameHistoryRequest {
    pub name: String,
}

#[derive(Clone, Deserialize, Serialize, TS)]
#[ts(export)]
pub struct NameHistoryData {
    pub count_both: Vec<i64>,
    pub count_f: Vec<i64>,
    pub count_m: Vec<i64>,
    pub dense_rank_both: Vec<i64>,
    pub dense_rank_f: Vec<i64>,
    pub dense_rank_m: Vec<i64>,
    pub popularity_both: Vec<f64>,
    pub popularity_f: Vec<f64>,
    pub popularity_m: Vec<f64>,
}

#[derive(Clone, Deserialize, Serialize, TS)]
#[ts(export)]
pub enum GetNameHistoryResponse {
    NameHistory(NameHistoryData),
    NameNotFound,
}

#[handler(query)]
pub async fn get_name_history(
    state: AppState,
    request: GetNameHistoryRequest,
) -> GetNameHistoryResponse {
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

    // Collect all rows from the database
    let rows: Vec<(i32, i64, i64, i64, i64, i64, i64, f64, f64, f64)> = stmt
        .query_map([&request.name], |row| {
            Ok((
                row.get(0)?, // year
                row.get(1)?, // count_both
                row.get(2)?, // count_f
                row.get(3)?, // count_m
                row.get(4)?, // dense_rank_both
                row.get(5)?, // dense_rank_f
                row.get(6)?, // dense_rank_m
                row.get(7)?, // popularity_both
                row.get(8)?, // popularity_f
                row.get(9)?, // popularity_m
            ))
        })
        .unwrap()
        .collect::<Result<Vec<_>, _>>()
        .unwrap();

    // Return error if name is not found
    if rows.is_empty() {
        return GetNameHistoryResponse::NameNotFound;
    }

    // Find the maximum year
    let max_year = rows
        .iter()
        .map(|(year, _, _, _, _, _, _, _, _, _)| *year)
        .max()
        .unwrap_or(1880);
    let min_year = 1880;

    // Create a map from year to data for quick lookup
    let year_data: std::collections::HashMap<i32, (i64, i64, i64, i64, i64, i64, f64, f64, f64)> =
        rows.into_iter()
            .map(|(year, cb, cf, cm, drb, drf, drm, pb, pf, pm)| {
                (year, (cb, cf, cm, drb, drf, drm, pb, pf, pm))
            })
            .collect();

    // Build arrays, filling gaps with zeros
    let mut count_both = Vec::new();
    let mut count_f = Vec::new();
    let mut count_m = Vec::new();
    let mut dense_rank_both = Vec::new();
    let mut dense_rank_f = Vec::new();
    let mut dense_rank_m = Vec::new();
    let mut popularity_both = Vec::new();
    let mut popularity_f = Vec::new();
    let mut popularity_m = Vec::new();

    for y in min_year..=max_year {
        if let Some((cb, cf, cm, drb, drf, drm, pb, pf, pm)) = year_data.get(&y) {
            count_both.push(*cb);
            count_f.push(*cf);
            count_m.push(*cm);
            dense_rank_both.push(*drb);
            dense_rank_f.push(*drf);
            dense_rank_m.push(*drm);
            popularity_both.push(*pb);
            popularity_f.push(*pf);
            popularity_m.push(*pm);
        } else {
            // Fill gaps with zeros
            count_both.push(0);
            count_f.push(0);
            count_m.push(0);
            dense_rank_both.push(0);
            dense_rank_f.push(0);
            dense_rank_m.push(0);
            popularity_both.push(0.0);
            popularity_f.push(0.0);
            popularity_m.push(0.0);
        }
    }

    GetNameHistoryResponse::NameHistory(NameHistoryData {
        count_both,
        count_f,
        count_m,
        dense_rank_both,
        dense_rank_f,
        dense_rank_m,
        popularity_both,
        popularity_f,
        popularity_m,
    })
}
