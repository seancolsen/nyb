use std::collections::HashMap;
use std::fmt::Write;
use std::hash::{DefaultHasher, Hash, Hasher};

use duckdb::{ToSql, types::ToSqlOutput};
use ordered_float::OrderedFloat;
use qubit::handler;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::utils::QueryParamMap;
use crate::{
    AppState,
    constants::{MAX_YEAR, MIN_YEAR},
};

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
    pub text_query: Option<TextQuery>,
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
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Filter {
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
                selection: Selection::OneYear {
                    year: MAX_YEAR as u16,
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
    pub selection: Selection,
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
    fn get_sql_expr(&self) -> &str {
        match self {
            Measurement::Popularity { gender_selection } => match gender_selection {
                GenderSelection::F => "popularity_f",
                GenderSelection::M => "popularity_m",
                GenderSelection::Both => "popularity_both",
            },
            Measurement::DenseRank { gender_selection } => match gender_selection {
                GenderSelection::F => "dense_rank_f",
                GenderSelection::M => "dense_rank_m",
                GenderSelection::Both => "dense_rank_both",
            },
            Measurement::Count { gender_selection } => match gender_selection {
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
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum GenderSelection {
    F,
    M,
    Both,
}

#[derive(Deserialize, Serialize, TS, Copy, Clone, Hash, Eq, PartialEq)]
#[serde(tag = "type", rename_all = "camelCase")]
#[ts(export)]
pub enum Selection {
    #[serde(rename_all = "camelCase")]
    OneYear { year: u16 },
    #[serde(rename_all = "camelCase")]
    ManyYears {
        aggregate_function: AggregateFunction,
        range: Range,
    },
}

impl Selection {
    pub fn get_range(&self) -> Range {
        match self {
            Selection::OneYear { year } => Range::Between {
                min: *year,
                max: *year,
            },
            Selection::ManyYears { range, .. } => *range,
        }
    }
}

#[derive(Deserialize, Serialize, TS, Copy, Clone, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum AggregateFunction {
    Ave,
    Min,
    Max,
    Trend,
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

#[derive(Deserialize, Serialize, TS, Copy, Clone, Hash, Eq, PartialEq)]
#[serde(tag = "type", rename_all = "camelCase")]
#[ts(export)]
pub enum Range {
    #[serde(rename_all = "camelCase")]
    Generation {
        generation: Generation,
    },
    #[serde(rename_all = "camelCase")]
    Previous {
        previous: u8,
    },
    #[serde(rename_all = "camelCase")]
    Between {
        min: u16,
        max: u16,
    },
    AllLivingPeople,
    AllYears,
}

impl Range {
    /// If this range represents one year, return that year. Otherwise return None.
    pub fn get_single_year(&self) -> Option<u16> {
        match self {
            Range::Between { min, max } if min == max => Some(*min),
            _ => None,
        }
    }

    pub fn gen_cte_name(&self) -> String {
        let mut hasher = DefaultHasher::new();
        self.hash(&mut hasher);
        let hash = hasher.finish();
        format!("_{}", hash)
    }

    pub fn gen_query(&self, params: &mut QueryParamMap) -> String {
        match self {
            Range::AllYears => render_year_range_query(
                params.set(Box::new(MIN_YEAR)),
                params.set(Box::new(MAX_YEAR)),
            ),
            Range::Between { min, max } => {
                render_year_range_query(params.set(Box::new(*min)), params.set(Box::new(*max)))
            }
            Range::Previous { previous } => render_year_range_query(
                params.set(Box::new(MAX_YEAR - *previous as usize)),
                params.set(Box::new(MAX_YEAR)),
            ),
            Range::Generation { generation } => {
                let (min, max) = generation.get_min_max_years();
                render_year_range_query(params.set(Box::new(min)), params.set(Box::new(max)))
            }

            Range::AllLivingPeople => todo!(),
        }
    }
}

#[derive(Deserialize, Serialize, TS, Copy, Clone, Hash, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
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

impl Generation {
    pub fn get_min_max_years(&self) -> (u16, u16) {
        match self {
            Generation::Lost => (MIN_YEAR as u16, 1900),
            Generation::Greatest => (1901, 1927),
            Generation::Silent => (1928, 1945),
            Generation::Boomer => (1946, 1964),
            Generation::X => (1965, 1980),
            Generation::Millennial => (1981, 1996),
            Generation::Z => (1997, 2012),
            Generation::Alpha => (2013, MAX_YEAR as u16),
        }
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
    sorting_expression: Option<String>,
}

fn build_cte(
    params: &mut QueryParamMap,
    range: Range,
    statistics: HashMap<Statistic, Purpose>,
) -> Cte {
    let name = range.gen_cte_name();
    let single_year = range.get_single_year();
    let is_multi_year = single_year.is_none();
    let mut sorting_expression: Option<String> = None;
    let mut filtering_expressions = Vec::<String>::new();
    let mut query = String::with_capacity(1000);

    if is_multi_year {
        query.push_str("WITH all_years AS (\n");
        query.push_str(&range.gen_query(params));
        query.push_str("\n)\n");
    }

    query.push_str("SELECT\n  name_year.name,");

    for (statistic, purpose) in statistics {
        query.push_str("\n  ");
        let e = format!("coalesce({}, 0.0)", statistic.measurement.get_sql_expr());
        match statistic.selection {
            Selection::OneYear { .. } => query.push_str(&e),
            Selection::ManyYears {
                aggregate_function, ..
            } => match aggregate_function {
                AggregateFunction::Ave => write!(&mut query, "avg({e})").unwrap(),
                AggregateFunction::Min => write!(&mut query, "min({e})").unwrap(),
                AggregateFunction::Max => write!(&mut query, "max({e})").unwrap(),
                AggregateFunction::Trend => {
                    write!(&mut query, "regr_slope({e}, name_year.year)").unwrap()
                }
            },
        }

        let hash = statistic.measurement.get_hash();
        write!(&mut query, " AS _{hash},").unwrap();

        let column = || format!("{name}._{hash}");
        if let Some(direction) = purpose.sorting {
            sorting_expression = Some(format!("{} {}", column(), direction));
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

    if let Some(year) = single_year {
        write!(
            &mut query,
            "\nFROM name_year\nWHERE name_year.year = {}",
            params.set(Box::new(year))
        )
        .unwrap();
    } else {
        query.push_str(concat!(
            "\nFROM all_years",
            "\nLEFT JOIN name_year ON name_year.year = all_years.year",
            "\nGROUP BY name_year.name",
        ));
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

    let range_map = {
        let mut map = HashMap::<Range, HashMap<Statistic, Purpose>>::new();
        for filter in request.filters {
            map.entry(filter.statistic.selection.get_range())
                .or_default()
                .entry(filter.statistic)
                .or_default()
                .add_filter(filter.comparison);
        }
        map.entry(sort.statistic.selection.get_range())
            .or_default()
            .entry(sort.statistic)
            .or_default()
            .sorting = Some(sort.direction);
        map
    };

    let mut query = String::with_capacity(1000);
    let mut params = QueryParamMap::new();
    let mut where_expressions = Vec::<String>::new();
    let mut sorting_expression: Option<String> = None;
    let mut join_expressions = Vec::<String>::new();

    let ctes: Vec<Cte> = range_map
        .into_iter()
        .map(|(range, statistics)| build_cte(&mut params, range, statistics))
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
        names.push(NameData { name, shape });
    }

    Ok(SearchNamesResponse { names })
}
