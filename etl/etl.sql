-- =============================================================================
-- import

create temporary table import (
  year integer,
  name text,
  gender text,
  count integer
);

-- Load data from unified CSV file
INSERT INTO import (year, name, gender, count)
SELECT year, name, gender, count
FROM read_csv(
  'source-data/unified.csv',
  header=false,
  columns={year: 'INTEGER', name: 'TEXT', gender: 'TEXT', count: 'INTEGER'}
);

update import
set name = 'Unknown'
where name in (
  '',
  'Newborn',
  'Infant',
  'Infantof',
  'Baby',
  'Child',
  'Boy',
  'Girl',
  'Babyboy',
  'Babygirl'
);


-- =============================================================================
-- name

create or replace sequence name_seq;
create or replace table name (
  id int primary key default nextval('name_seq'),
  name text unique,
  -- A 40-dimensional vector of floats used for vector similarity and chart
  -- visualization.
  -- 
  -- The first 20 values are `popularity_f` values, averaged over 5-year windows
  -- for the past 100 years. The remaining 20 values are `popularity_m` values,
  -- averaged over 5-year windows for the past 100 years.
  shape float[40],
);
insert into name (name) select distinct name from import;
create index x_name__name on name (name);


-- =============================================================================
-- data_point

create type gender as enum ('f', 'm');
create or replace sequence data_point_id_seq;
create or replace temporary table data_point (
  id int primary key default nextval('data_point_id_seq'),
  year short,
  name int, -- implicit FK to name(id),
  gender gender,
  count int
);
insert into data_point (year, name, gender, count)
  select
    year,
    name.id,
    case when gender = 'F' then 'f' else 'm' end,
    count
  from import
  join name on import.name = name.name;


-- =============================================================================
-- name_year

create or replace table name_year (
  name int not null, -- implicit FK to name(id),
  year short not null,
  count_both int, 
  count_f int, 
  count_m int, 
  dense_rank_both int, 
  dense_rank_f int, 
  dense_rank_m int, 
  gender_balance real, 
  gender_neutrality real, 
  popularity_both real, 
  popularity_f real, 
  popularity_m real, 
  primary key (name, year)
);

insert into name_year by name
select
  name,
  year,
  sum(count * (case when gender = 'f' then 1 else 0 end)) as count_f,
  sum(count * (case when gender = 'm' then 1 else 0 end)) as count_m,
from data_point
group by name, year;

-- count_both
update name_year set count_both = count_f + count_m;

-- gender_balance
update name_year set gender_balance = (count_f - count_m) / (count_both);

-- gender_neutrality
update name_year set gender_neutrality = 1 - abs(gender_balance);

-- dense_rank_both
update name_year as t set dense_rank_both = s.dense_rank_both
from (
  select name, year,
    dense_rank() over (partition by year order by count_both desc) as dense_rank_both,
  from name_year
) as s where t.name = s.name and t.year = s.year;

-- dense_rank_f
update name_year as t set dense_rank_f = s.dense_rank_f
from (
  select name, year,
    dense_rank() over (partition by year order by count_f desc) as dense_rank_f,
  from name_year
) as s where t.name = s.name and t.year = s.year;

-- dense_rank_m
update name_year as t set dense_rank_m = s.dense_rank_m
from (
  select name, year,
    dense_rank() over (partition by year order by count_m desc) as dense_rank_m,
  from name_year
) as s where t.name = s.name and t.year = s.year;

-- (cached intermediate values to help with subsequent calculations)
create or replace temporary table year (
  year short primary key,
  dense_rank_both_max int,
  dense_rank_f_max int,
  dense_rank_m_max int,
);
insert into year by name
select
  year,
  max(dense_rank_both) as dense_rank_both_max,
  max(dense_rank_f) as dense_rank_f_max,
  max(dense_rank_m) as dense_rank_m_max,
from name_year
group by year;

-- popularity_both
update name_year as t set popularity_both = s.popularity_both
from (
  select name, name_year.year as year,
    1 - dense_rank_both / dense_rank_both_max as popularity_both,
  from name_year
  join year on name_year.year = year.year
) as s where t.name = s.name and t.year = s.year;

-- popularity_f
update name_year as t set popularity_f = s.popularity_f
from (
  select name, name_year.year as year,
    1 - dense_rank_f / dense_rank_f_max as popularity_f,
  from name_year
  join year on name_year.year = year.year
) as s where t.name = s.name and t.year = s.year;

-- popularity_m
update name_year as t set popularity_m = s.popularity_m
from (
  select name, name_year.year as year,
    1 - dense_rank_m / dense_rank_m_max as popularity_m,
  from name_year
  join year on name_year.year = year.year
) as s where t.name = s.name and t.year = s.year;

create index x_name_year__name on name_year (name);
create index x_name_year__year on name_year (year);
create index x_name_year__count_both on name_year (count_both);
create index x_name_year__count_f on name_year (count_f);
create index x_name_year__count_m on name_year (count_m);
create index x_name_year__dense_rank_both on name_year (dense_rank_both);
create index x_name_year__dense_rank_f on name_year (dense_rank_f);
create index x_name_year__dense_rank_m on name_year (dense_rank_m);
create index x_name_year__gender_balance on name_year (gender_balance);
create index x_name_year__gender_neutrality on name_year (gender_neutrality);
create index x_name_year__popularity_both on name_year (popularity_both);
create index x_name_year__popularity_f on name_year (popularity_f);
create index x_name_year__popularity_m on name_year (popularity_m);


-- =============================================================================
-- name shape

-- Calculate shape vector for each name The shape is a 40-element vector: 20
-- popularity_f averages + 20 popularity_m averages Each value represents the
-- average popularity over a 5-year window for the past 100 years

create or replace temporary function year_bucket(year int, max_year int) as
  year + (max_year - year) % 5;

update name as t set shape = s.shape from (
  with
    max_year as ( select max(year) as v from name_year ),
    name_year_values as (
      select
        name,
        year_bucket(year, (select v from max_year)) as bucket,
        popularity_f as f,
        popularity_m as m,
      from name_year
      where year >= (select v from max_year) - 100
    ),
    name_buckets as (
      select
        name,
        bucket,
        avg(f) as f,
        avg(m) as m,
      from name_year_values
      group by name, bucket
    ),
    all_buckets as (
      select unnest(range(
        (select v from max_year) - 95,
        (select v from max_year) + 1,
        5
      )) as bucket
    )
  select
    name.id,
    array_agg(coalesce(name_buckets.f, 0.0) order by all_buckets.bucket) ||
    array_agg(coalesce(name_buckets.m, 0.0) order by all_buckets.bucket) as shape,
  from all_buckets
  cross join name
  left join name_buckets on
    name_buckets.name = name.id and
    name_buckets.bucket = all_buckets.bucket
  group by name.id
) as s where t.id = s.id;

-- =============================================================================
-- similar names

create or replace table similar_name (
  name int not null, -- implicit FK to name(id),
  similar_name int not null, -- implicit FK to name(id),
  distance real not null,
  primary key (name, similar_name),
);

insert into similar_name by name
with
  candidates as (
    select distinct name as id
    from name_year
    -- Candidate names must have a year where popularity is at least 0.1
    where popularity_both > 0.1
  ),
  pairs as (
    select
      a.id as a,
      b.id as b,
      array_distance(a.shape, b.shape) as dist
    from candidates ca
    cross join candidates cb
    join name a on a.id = ca.id
    join name b on b.id = cb.id
    where a.id <> b.id
  ),
  ranked_pairs as (
    select
      a,
      b,
      dist,
      row_number() over (partition by a order by dist) as rank
    from pairs
  )
select
  a as name,
  b as similar_name,
  dist as distance
from ranked_pairs
where rank <= 100;

create index x_similar_name__name on similar_name (name);
create index x_similar_name__distance on similar_name (distance);

-- =============================================================================
-- analysis

create or replace macro show_name_history(n) as table
  select
    year,
    popularity_f,
    popularity_m,
  from name_year
  join name on name.id = name_year.name
  where name.name = n
  order by year desc;

create or replace macro show_similar_names(n) as table
  select
    b.name,
    similar_name.distance
  from similar_name
  join name a on a.id = similar_name.name
  join name b on b.id = similar_name.similar_name
  where a.name = n
  order by similar_name.distance;


