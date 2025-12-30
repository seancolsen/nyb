use std::collections::HashMap;

use duckdb::ToSql;

pub struct QueryParamMap {
    query_params: HashMap<String, Box<dyn ToSql>>,
}

impl QueryParamMap {
    pub fn new() -> Self {
        Self {
            query_params: HashMap::new(),
        }
    }

    pub fn set(&mut self, value: Box<dyn ToSql>) -> String {
        let prefixed_key = format!("$p{}", self.query_params.len());
        let raw_key = format!("p{}", self.query_params.len());
        self.query_params.insert(raw_key, value);
        prefixed_key
    }

    pub fn get(&self, key: &str) -> Option<&Box<dyn ToSql>> {
        self.query_params.get(key)
    }

    pub fn merge(&mut self, other: QueryParamMap) {
        self.query_params.extend(other.query_params);
    }
}
