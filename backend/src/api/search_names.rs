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
#[ts(export)]
pub struct SearchNamesRequest {
    pub text_query: Option<TextQuery>,
    pub filters: Vec<Filter>,
    pub sort: Option<Statistic>,
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

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
pub struct Filter {
    pub statistic: Statistic,
    pub comparison: Comparison,
}

#[derive(Deserialize, Serialize, TS)]
#[ts(export)]
pub struct Statistic {
    pub measurement: Measurement,
    pub selection: Selection,
}

#[derive(Deserialize, Serialize, TS, Hash, Eq, PartialEq)]
#[ts(export)]
pub enum Measurement {
    Popularity(GenderSelection),
    DenseRank(GenderSelection),
    Count(GenderSelection),
    Masculinity,
    Femininity,
    GenderNeutrality,
}

impl Measurement {
    fn get_sql_expr(&self) -> &str {
        match self {
            Measurement::Popularity(gender_selection) => match gender_selection {
                GenderSelection::F => "popularity_f",
                GenderSelection::M => "popularity_m",
                GenderSelection::Both => "popularity_both",
            },
            Measurement::DenseRank(gender_selection) => match gender_selection {
                GenderSelection::F => "dense_rank_f",
                GenderSelection::M => "dense_rank_m",
                GenderSelection::Both => "dense_rank_both",
            },
            Measurement::Count(gender_selection) => match gender_selection {
                GenderSelection::F => "count_f",
                GenderSelection::M => "count_m",
                GenderSelection::Both => "count_both",
            },
            Measurement::Masculinity => "((1.0 - gender_balance) / 2.0)",
            Measurement::Femininity => "((gender_banance + 1.0 ) / 2.0)",
            Measurement::GenderNeutrality => "gender_neutrality",
        }
    }

    fn get_hash(&self) -> u64 {
        let mut hasher = DefaultHasher::new();
        self.hash(&mut hasher);
        hasher.finish()
    }
}

#[derive(Deserialize, Serialize, TS, Hash, Eq, PartialEq)]
#[ts(export)]
pub enum GenderSelection {
    F,
    M,
    Both,
}

#[derive(Deserialize, Serialize, TS, Copy, Clone, Hash, Eq, PartialEq)]
#[ts(export)]
pub enum Selection {
    OneYear(u16),
    ManyYears {
        aggregate_function: AggregateFunction,
        range: Range,
    },
}

impl Selection {
    fn gen_cte_name(&self) -> String {
        let mut hasher = DefaultHasher::new();
        self.hash(&mut hasher);
        let hash = hasher.finish();
        format!("_{}", hash)
    }
}

#[derive(Deserialize, Serialize, TS, Copy, Clone, Hash, Eq, PartialEq)]
#[ts(export)]
pub enum AggregateFunction {
    Ave,
    Min,
    Max,
    Trend,
}

#[derive(Deserialize, Serialize, TS, Copy, Clone, Hash, Eq, PartialEq)]
#[ts(export)]
pub enum Range {
    Generation(Generation),
    Previous(u8),
    Between(u16, u16),
    AllLivingPeople,
    AllYears,
}

#[derive(Deserialize, Serialize, TS, Copy, Clone, Hash, Eq, PartialEq)]
#[ts(export)]
pub enum Generation {
    Lost,
    Greatest,
    Silent,
    Boomer,
    X,
    Millennial,
    Z,
    Alpha,
}

#[derive(Deserialize, Serialize, TS, Hash)]
#[ts(export)]
pub enum Comparison {
    Gt(F64Number),
    Lt(F64Number),
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
    pub shape: String,
}

struct Purpose {
    sorting: bool,
    filtering: Vec<Comparison>,
}

impl Default for Purpose {
    fn default() -> Self {
        Self {
            sorting: false,
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
    select_statement: String,
    params: QueryParamMap,
    filtering_expressions: Vec<String>,
    sorting_expression: Option<String>,
}

fn build_cte_for_one_year(
    name: String,
    year: u16,
    measurements: HashMap<Measurement, Purpose>,
) -> Cte {
    let mut params = QueryParamMap::new();
    let mut sorting_expression: Option<String> = None;
    let mut filtering_expressions = Vec::<String>::new();
    let mut query = String::with_capacity(1000);

    query.push_str("SELECT\n  name,");

    for (measurement, purpose) in measurements {
        query.push_str("\n  ");
        query.push_str(measurement.get_sql_expr());
        let hash = measurement.get_hash();
        write!(&mut query, " AS _{hash},").unwrap();
        let column = || format!("{name}._{hash}");
        if purpose.sorting {
            sorting_expression = Some(format!("{} DESC", column()));
        }
        for comparison in purpose.filtering {
            let expr = match comparison {
                Comparison::Gt(v) => format!("{} > {}", column(), params.set(Box::new(v))),
                Comparison::Lt(v) => format!("{} < {}", column(), params.set(Box::new(v))),
            };
            filtering_expressions.push(expr);
        }
    }

    query.push_str("\nFROM name_year");

    let p_year = params.set(Box::new(year));
    write!(&mut query, "\nWHERE year = {p_year}").unwrap();

    Cte {
        name,
        select_statement: query,
        params,
        filtering_expressions,
        sorting_expression,
    }
}

fn build_cte_for_many_years(
    name: String,
    aggregate_function: AggregateFunction,
    range: Range,
    measurements: HashMap<Measurement, Purpose>,
) -> Cte {
    let mut params = QueryParamMap::new();
    let mut sorting_expression: Option<String> = None;
    let mut filtering_expressions = Vec::<String>::new();
    let mut select_statement = String::with_capacity(1000);
    let mut columns = Vec::<String>::new();

    todo!()
}

fn build_cte(selection: Selection, measurements: HashMap<Measurement, Purpose>) -> Cte {
    let name = selection.gen_cte_name();
    match selection {
        Selection::OneYear(year) => build_cte_for_one_year(name, year, measurements),
        Selection::ManyYears {
            aggregate_function,
            range,
        } => build_cte_for_many_years(name, aggregate_function, range, measurements),
    }
}

#[handler(query)]
pub async fn search_names(
    state: AppState,
    request: SearchNamesRequest,
) -> Result<SearchNamesResponse, String> {
    let sort = request.sort.unwrap_or(Statistic {
        measurement: Measurement::Popularity(GenderSelection::Both),
        selection: Selection::OneYear(MAX_YEAR as u16 - 15),
    });

    let directive_map = {
        let mut map = HashMap::<Selection, HashMap<Measurement, Purpose>>::new();
        for filter in request.filters {
            map.entry(filter.statistic.selection)
                .or_default()
                .entry(filter.statistic.measurement)
                .or_default()
                .add_filter(filter.comparison);
        }
        map.entry(sort.selection)
            .or_default()
            .entry(sort.measurement)
            .or_default()
            .sorting = true;
        map
    };

    let ctes: Vec<Cte> = directive_map
        .into_iter()
        .map(|(selection, measurements)| build_cte(selection, measurements))
        .collect();

    let mut query = String::with_capacity(1000);
    let mut params = QueryParamMap::new();
    let mut where_expressions = Vec::<String>::new();
    let mut sorting_expression: Option<String> = None;
    let mut join_expressions = Vec::<String>::new();

    let has_ctes = !ctes.is_empty();
    let cte_count = ctes.len();
    if has_ctes {
        query.push_str("WITH\n");
    }
    for (i, cte) in ctes.into_iter().enumerate() {
        let name = cte.name;
        let select = cte.select_statement;
        write!(&mut query, "{name} AS (\n{select}\n)").unwrap();
        if i < cte_count - 1 {
            query.push_str(",\n");
        }

        params.merge(cte.params);
        where_expressions.extend(cte.filtering_expressions);
        if let Some(e) = cte.sorting_expression {
            sorting_expression = Some(e);
        }
        join_expressions.push(format!("JOIN {name} ON name.id = {name}.name"));
    }
    if has_ctes {
        query.push_str("\n");
    }
    query.push_str("SELECT\n  name.name,\n  name.condensed_shape\nFROM name");

    for expression in join_expressions {
        write!(&mut query, "\n{expression}").unwrap();
    }

    if let Some(text_query) = request.text_query {
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

    if let Some(expression) = sorting_expression {
        write!(&mut query, "\nORDER BY {expression}").unwrap();
    }

    query.push_str("\nLIMIT 1000");

    #[cfg(debug_assertions)]
    {
        println!("{query}\n");
    }

    let db = state.db.lock().unwrap();
    let mut stmt = db.prepare(&query).map_err(|e| e.to_string())?;

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
        names.push(NameData { name, shape });
    }

    Ok(SearchNamesResponse { names })
}
