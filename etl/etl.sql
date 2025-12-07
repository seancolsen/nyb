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
  name text unique
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
  name int not null references name (id),
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


