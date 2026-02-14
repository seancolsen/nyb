use std::collections::HashMap;
use std::fmt::Write;
use std::hash::{DefaultHasher, Hash, Hasher};

use duckdb::{ToSql, types::ToSqlOutput};
use ordered_float::OrderedFloat;
use qubit::handler;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::utils::QueryParamMap;
use crate::{AppState, constants::MAX_YEAR};

#[derive(Debug, Clone, Copy, Deserialize, Serialize, Hash, PartialEq, Eq)]
/// A newtype wrapper around `OrderedFloat<f64>`. Using this in our custom types allows us to
/// derive important combinations of traits such as Hash, TS, ToSql, etc.
pub struct F64Number(pub OrderedFloat<f64>);

impl TS for F64Number {
    type WithoutGenerics = Self;

    fn name() -> String {
        "number".to_string()
    }

    fn inline() -> String {
        "number".to_string()
    }

    fn inline_flattened() -> String {
        "number".to_string()
    }

    fn decl() -> String {
        String::new()
    }

    fn decl_concrete() -> String {
        String::new()
    }
}

impl std::fmt::Display for F64Number {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl ToSql for F64Number {
    fn to_sql(&self) -> Result<ToSqlOutput<'_>, duckdb::Error> {
        Ok(ToSqlOutput::from(self.0.into_inner()))
    }
}

#[derive(Deserialize, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SearchNamesRequest {
    pub filters: Vec<Filter>,
    pub sort: Option<Sort>,
}

#[derive(Deserialize, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct TextQuery {
    pub query: String,
    pub method: SearchMethod,
}

#[derive(Deserialize, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum SearchMethod {
    Contains,
    StartsWith,
    RegExp,
}

#[derive(Deserialize, Serialize, TS)]
#[serde(tag = "type", rename_all = "camelCase")]
#[ts(export)]
pub enum Filter {
    Numerical(StatisticFilter),
    Textual(TextQuery),
}

#[derive(Deserialize, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct StatisticFilter {
    pub statistic: Statistic,
    pub comparison: Comparison,
}

#[derive(Deserialize, Serialize, TS, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Sort {
    pub statistic: Statistic,
    pub direction: SortDirection,
}

impl Default for Sort {
    fn default() -> Self {
        Self {
            statistic: Statistic {
                measurement: Measurement::Popularity {
                    gender_selection: GenderSelection::Both,
                },
                year_range: YearRange {
                    min: MAX_YEAR as u16,
                    max: MAX_YEAR as u16,
                },
            },
            direction: SortDirection::Desc,
        }
    }
}

#[derive(Deserialize, Serialize, TS, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum SortDirection {
    Asc,
    Desc,
}

impl std::fmt::Display for SortDirection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SortDirection::Asc => write!(f, "ASC"),
            SortDirection::Desc => write!(f, "DESC"),
        }
    }
}

#[derive(Deserialize, Serialize, TS, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Statistic {
    pub measurement: Measurement,
    pub year_range: YearRange,
}

#[derive(Deserialize, Serialize, TS, Hash, Eq, PartialEq)]
#[serde(tag = "type", rename_all = "camelCase")]
#[ts(export)]
pub enum Measurement {
    #[serde(rename_all = "camelCase")]
    Popularity {
        gender_selection: GenderSelection,
    },
    #[serde(rename_all = "camelCase")]
    DenseRank {
        gender_selection: GenderSelection,
    },
    #[serde(rename_all = "camelCase")]
    Count {
        gender_selection: GenderSelection,
    },
    Masculinity,
    Femininity,
    GenderNeutrality,
}

impl Measurement {
    fn get_hash(&self) -> u64 {
        let mut hasher = DefaultHasher::new();
        self.hash(&mut hasher);
        hasher.finish()
    }
}

#[derive(Deserialize, Serialize, TS, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum GenderSelection {
    F,
    M,
    Both,
}

fn render_year_range_query(min_year_param: String, max_year_param: String) -> String {
    format!(
        concat!(
            "WITH RECURSIVE y(v) AS (\n",
            "  SELECT {min} UNION ALL SELECT v + 1 FROM y WHERE v < {max}\n",
            ") SELECT v AS year FROM y",
        ),
        min = min_year_param,
        max = max_year_param
    )
}

#[derive(Deserialize, Serialize, TS, Hash, Eq, PartialEq, Copy, Clone)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct YearRange {
    min: u16,
    max: u16,
}

impl YearRange {
    /// If this YearRange represents one year, return that year. Otherwise return None.
    pub fn get_single_year(&self) -> Option<u16> {
        if self.min == self.max {
            Some(self.min)
        } else {
            None
        }
    }

    pub fn gen_cte_name(&self) -> String {
        let mut hasher = DefaultHasher::new();
        self.hash(&mut hasher);
        let hash = hasher.finish();
        format!("_{}", hash)
    }

    pub fn gen_query(&self, params: &mut QueryParamMap) -> String {
        render_year_range_query(
            params.set(Box::new(self.min)),
            params.set(Box::new(self.max)),
        )
    }
}

#[derive(Deserialize, Serialize, TS, Hash)]
#[serde(tag = "type", rename_all = "camelCase")]
#[ts(export)]
pub enum Comparison {
    #[serde(rename_all = "camelCase")]
    Gt { value: F64Number },
    #[serde(rename_all = "camelCase")]
    Lt { value: F64Number },
}

#[derive(Clone, Deserialize, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SearchNamesResponse {
    pub names: Vec<NameData>,
}

#[derive(Clone, Deserialize, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct NameData {
    pub name: String,
    pub shape: String,
    pub sorting_value: f64,
}

struct Purpose {
    sorting: Option<SortDirection>,
    filtering: Vec<Comparison>,
}

impl Default for Purpose {
    fn default() -> Self {
        Self {
            sorting: None,
            filtering: Vec::new(),
        }
    }
}

impl Purpose {
    fn add_filter(&mut self, comparison: Comparison) {
        self.filtering.push(comparison);
    }
}

struct Cte {
    name: String,
    query: String,
    filtering_expressions: Vec<String>,
    sorting_expression: Option<(String, SortDirection)>,
}

const POPULARITY_BOTH: Measurement = Measurement::Popularity {
    gender_selection: GenderSelection::Both,
};
const POPULARITY_F: Measurement = Measurement::Popularity {
    gender_selection: GenderSelection::F,
};
const POPULARITY_M: Measurement = Measurement::Popularity {
    gender_selection: GenderSelection::M,
};
const RANK_BOTH: Measurement = Measurement::DenseRank {
    gender_selection: GenderSelection::Both,
};
const RANK_F: Measurement = Measurement::DenseRank {
    gender_selection: GenderSelection::F,
};
const RANK_M: Measurement = Measurement::DenseRank {
    gender_selection: GenderSelection::M,
};
const COUNT_BOTH: Measurement = Measurement::Count {
    gender_selection: GenderSelection::Both,
};
const COUNT_F: Measurement = Measurement::Count {
    gender_selection: GenderSelection::F,
};
const COUNT_M: Measurement = Measurement::Count {
    gender_selection: GenderSelection::M,
};
const FEMININITY: Measurement = Measurement::Femininity;
const MASCULINITY: Measurement = Measurement::Masculinity;
const GENDER_NEUTRALITY: Measurement = Measurement::GenderNeutrality;

fn build_cte(
    params: &mut QueryParamMap,
    year_range: YearRange,
    mut measurements: HashMap<Measurement, Purpose>,
) -> Cte {
    let name = year_range.gen_cte_name();

    // TODO return early if single year for perf
    // let single_year = year_range.get_single_year();

    let mut sorting_expression: Option<(String, SortDirection)> = None;
    let mut filtering_expressions = Vec::<String>::new();
    let mut query = String::with_capacity(1000);

    // Build measurement dependencies
    {
        if measurements.contains_key(&POPULARITY_BOTH) {
            measurements.entry(RANK_BOTH).or_default();
        }
        if measurements.contains_key(&POPULARITY_F) {
            measurements.entry(RANK_F).or_default();
        }
        if measurements.contains_key(&POPULARITY_M) {
            measurements.entry(RANK_M).or_default();
        }
        if measurements.contains_key(&RANK_BOTH) {
            measurements.entry(COUNT_BOTH).or_default();
        }
        if measurements.contains_key(&RANK_F) {
            measurements.entry(COUNT_F).or_default();
        }
        if measurements.contains_key(&RANK_M) {
            measurements.entry(COUNT_M).or_default();
        }
        if measurements.contains_key(&FEMININITY) {
            measurements.entry(COUNT_F).or_default();
            measurements.entry(COUNT_M).or_default();
        }
        if measurements.contains_key(&MASCULINITY) {
            measurements.entry(COUNT_F).or_default();
            measurements.entry(COUNT_M).or_default();
        }
        if measurements.contains_key(&GENDER_NEUTRALITY) {
            measurements.entry(COUNT_F).or_default();
            measurements.entry(COUNT_M).or_default();
        }
    }

    query.push_str("WITH\n");

    // `counts` CTE
    let min_year = params.set(Box::new(year_range.min));
    let max_year = params.set(Box::new(year_range.max));
    query.push_str("  counts AS (\n");
    query.push_str("    select\n");
    query.push_str("      name_year.name as name,\n");
    if measurements.contains_key(&COUNT_BOTH) {
        query.push_str("      sum(count_both) AS count_both,\n");
    }
    if measurements.contains_key(&COUNT_F) {
        query.push_str("      sum(count_f) AS count_f,\n");
    }
    if measurements.contains_key(&COUNT_M) {
        query.push_str("      sum(count_m) AS count_m,\n");
    }
    query.push_str("    FROM name_year\n    WHERE\n");
    write!(&mut query, "      name_year.year >= {min_year} AND\n").unwrap();
    write!(&mut query, "      name_year.year <= {max_year}\n").unwrap();
    query.push_str("    GROUP BY name_year.name\n  )");

    let has_gender = measurements.contains_key(&FEMININITY)
        || measurements.contains_key(&MASCULINITY)
        || measurements.contains_key(&GENDER_NEUTRALITY);
    let has_ranks = measurements.contains_key(&RANK_BOTH)
        || measurements.contains_key(&RANK_F)
        || measurements.contains_key(&RANK_M);
    let has_popularity = measurements.contains_key(&POPULARITY_BOTH)
        || measurements.contains_key(&POPULARITY_F)
        || measurements.contains_key(&POPULARITY_M);

    // `gender` CTE
    if has_gender {
        // Gender balance SQL expression
        let bal = "(count_f - count_m) / (count_f + count_m)";
        query.push_str(",\n");
        query.push_str("  gender AS (\n");
        query.push_str("    SELECT\n");
        query.push_str("      name,\n");
        if measurements.contains_key(&FEMININITY) {
            write!(&mut query, "      (1.0+{bal})/2.0 AS femininity,\n").unwrap();
        }
        if measurements.contains_key(&MASCULINITY) {
            write!(&mut query, "      (1.0-{bal})/2.0 AS masculinity,\n").unwrap();
        }
        if measurements.contains_key(&GENDER_NEUTRALITY) {
            write!(&mut query, "      1.0-abs({bal}) AS gender_neutrality,\n").unwrap();
        }
        query.push_str("    FROM counts\n  )");
    }

    // `ranks` CTE
    if has_ranks {
        query.push_str(",\n");
        query.push_str("  ranks AS (\n");
        query.push_str("    SELECT\n");
        query.push_str("      name,\n");
        if measurements.contains_key(&RANK_BOTH) {
            query.push_str(
                "      dense_rank() OVER (ORDER BY count_both DESC) AS dense_rank_both,\n",
            );
        }
        if measurements.contains_key(&RANK_F) {
            query.push_str("      dense_rank() OVER (ORDER BY count_f DESC) AS dense_rank_f,\n");
        }
        if measurements.contains_key(&RANK_M) {
            query.push_str("      dense_rank() OVER (ORDER BY count_m DESC) AS dense_rank_m,\n");
        }
        query.push_str("    FROM counts\n  )");
    }

    // `max_ranks` CTE + `popularity` CTE
    if has_popularity {
        query.push_str(",\n");
        query.push_str("  max_ranks AS (\n");
        query.push_str("    SELECT\n");
        if measurements.contains_key(&POPULARITY_BOTH) {
            query.push_str("      max(dense_rank_both) AS dense_rank_both_max,\n");
        }
        if measurements.contains_key(&POPULARITY_F) {
            query.push_str("      max(dense_rank_f) AS dense_rank_f_max,\n");
        }
        if measurements.contains_key(&POPULARITY_M) {
            query.push_str("      max(dense_rank_m) AS dense_rank_m_max,\n");
        }
        query.push_str("    FROM ranks\n  ),\n");

        query.push_str("  popularity AS (\n");
        query.push_str("    SELECT\n");
        query.push_str("      name,\n");
        if measurements.contains_key(&POPULARITY_BOTH) {
            query.push_str("      1 - dense_rank_both / dense_rank_both_max as popularity_both,\n");
        }
        if measurements.contains_key(&POPULARITY_F) {
            query.push_str("      1 - dense_rank_f / dense_rank_f_max as popularity_f,\n");
        }
        if measurements.contains_key(&POPULARITY_M) {
            query.push_str("      1 - dense_rank_m / dense_rank_m_max as popularity_m,\n");
        }
        query.push_str("    FROM ranks\n");
        query.push_str("    CROSS JOIN max_ranks\n  )");
    }

    query.push_str("\n");

    fn get_measurement_expr(measurement: &Measurement) -> &'static str {
        match measurement {
            Measurement::Popularity { gender_selection } => match gender_selection {
                GenderSelection::Both => "popularity.popularity_both",
                GenderSelection::F => "popularity.popularity_f",
                GenderSelection::M => "popularity.popularity_m",
            },
            Measurement::DenseRank { gender_selection } => match gender_selection {
                GenderSelection::Both => "ranks.dense_rank_both",
                GenderSelection::F => "ranks.dense_rank_f",
                GenderSelection::M => "ranks.dense_rank_m",
            },
            Measurement::Count { gender_selection } => match gender_selection {
                GenderSelection::Both => "counts.count_both",
                GenderSelection::F => "counts.count_f",
                GenderSelection::M => "counts.count_m",
            },
            Measurement::Masculinity => "gender.masculinity",
            Measurement::Femininity => "gender.femininity",
            Measurement::GenderNeutrality => "gender.gender_neutrality",
        }
    }

    query.push_str("SELECT\n");
    query.push_str("  counts.name as name,\n");

    for (measurement, purpose) in measurements {
        if purpose.sorting == None && purpose.filtering.len() == 0 {
            continue;
        }

        let expr = get_measurement_expr(&measurement);
        let hash = measurement.get_hash();
        write!(&mut query, "  {expr} AS _{hash},\n").unwrap();

        let column = || format!("{name}._{hash}");
        if let Some(direction) = purpose.sorting {
            sorting_expression = Some((column(), direction));
        }
        for comparison in purpose.filtering {
            let expr = match comparison {
                Comparison::Gt { value } => {
                    format!("{} > {}", column(), params.set(Box::new(value)))
                }
                Comparison::Lt { value } => {
                    format!("{} < {}", column(), params.set(Box::new(value)))
                }
            };
            filtering_expressions.push(expr);
        }
    }

    query.push_str("FROM counts");
    if has_gender {
        query.push_str("\nJOIN gender ON gender.name = counts.name");
    }
    if has_ranks {
        query.push_str("\nJOIN ranks ON ranks.name = counts.name");
    }
    if has_popularity {
        query.push_str("\nJOIN popularity ON popularity.name = counts.name");
    }

    Cte {
        name,
        query,
        filtering_expressions,
        sorting_expression,
    }
}

#[handler(query)]
pub async fn search_names(
    state: AppState,
    request: SearchNamesRequest,
) -> Result<SearchNamesResponse, String> {
    let sort = request.sort.unwrap_or(Sort::default());
    let mut statistic_filters = Vec::<StatisticFilter>::new();
    let mut text_queries = Vec::<TextQuery>::new();

    for filter in request.filters {
        match filter {
            Filter::Numerical(f) => statistic_filters.push(f),
            Filter::Textual(f) => text_queries.push(f),
        }
    }

    let range_map = {
        let mut map = HashMap::<YearRange, HashMap<Measurement, Purpose>>::new();
        for filter in statistic_filters {
            map.entry(filter.statistic.year_range)
                .or_default()
                .entry(filter.statistic.measurement)
                .or_default()
                .add_filter(filter.comparison)
        }
        map.entry(sort.statistic.year_range)
            .or_default()
            .entry(sort.statistic.measurement)
            .or_default()
            .sorting = Some(sort.direction);
        map
    };

    let mut query = String::with_capacity(1000);
    let mut params = QueryParamMap::new();
    let mut where_expressions = Vec::<String>::new();
    let mut sorting_expression: Option<(String, SortDirection)> = None;
    let mut join_expressions = Vec::<String>::new();

    let ctes: Vec<Cte> = range_map
        .into_iter()
        .map(|(year_range, statistics)| build_cte(&mut params, year_range, statistics))
        .collect();

    let has_ctes = !ctes.is_empty();
    let cte_count = ctes.len();
    if has_ctes {
        query.push_str("WITH\n");
    }
    for (i, cte) in ctes.into_iter().enumerate() {
        let name = cte.name;
        let select = cte.query;
        write!(&mut query, "{name} AS (\n{select}\n)").unwrap();
        if i < cte_count - 1 {
            query.push_str(",\n");
        }

        where_expressions.extend(cte.filtering_expressions);
        if let Some((expr, direction)) = cte.sorting_expression {
            sorting_expression = Some((expr, direction));
        }
        join_expressions.push(format!("JOIN {name} ON name.id = {name}.name"));
    }
    if has_ctes {
        query.push_str("\n");
    }
    query.push_str("SELECT\n  name.name,\n  name.condensed_shape,");
    match &sorting_expression {
        Some((expression, _)) => write!(&mut query, "\n  {expression}").unwrap(),
        None => query.push_str("\n  0"),
    }
    query.push_str("\nFROM name");

    for expression in join_expressions {
        write!(&mut query, "\n{expression}").unwrap();
    }

    for text_query in text_queries {
        match text_query.method {
            SearchMethod::Contains => {
                let p = params.set(Box::new(format!("%{}%", text_query.query)));
                where_expressions.push(format!("name.name ILIKE {}", p));
            }
            SearchMethod::StartsWith => {
                let p = params.set(Box::new(format!("{}%", text_query.query)));
                where_expressions.push(format!("name.name ILIKE {}", p));
            }
            SearchMethod::RegExp => {
                let p = params.set(Box::new(text_query.query.clone()));
                where_expressions.push(format!("regexp_matches(name.name, {}, 'i')", p));
            }
        }
    }

    let where_expression_count = where_expressions.len();
    if !where_expressions.is_empty() {
        query.push_str("\nWHERE\n");
    }
    for (i, expression) in where_expressions.iter().enumerate() {
        write!(&mut query, "  {expression}").unwrap();
        if i < where_expression_count - 1 {
            query.push_str(" AND\n");
        }
    }

    if let Some((expression, direction)) = sorting_expression {
        write!(&mut query, "\nORDER BY {expression} {direction}").unwrap();
    }

    query.push_str("\nLIMIT 500");

    #[cfg(debug_assertions)]
    {
        println!("⚡\n{query}\n");
    }

    let db = state.db.lock().unwrap();
    let mut stmt = db.prepare_cached(&query).map_err(|e| e.to_string())?;

    let mut flat_params = Vec::<&dyn ToSql>::new();
    for i in 1..=stmt.parameter_count() {
        let param_name = stmt
            .parameter_name(i)
            .map_err(|e| format!("Failed to get parameter name at index {}: {}", i, e))?;
        let param_value = params
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
        let shape = row.get::<_, String>(1).map_err(|e| e.to_string())?;
        let sorting_value = row.get::<_, f64>(2).map_err(|e| e.to_string())?;
        names.push(NameData {
            name,
            shape,
            sorting_value,
        });
    }

    Ok(SearchNamesResponse { names })
}
