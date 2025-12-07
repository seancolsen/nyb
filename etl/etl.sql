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
  'Girl'
  'Babyboy',
  'Babygirl'
);


-- =============================================================================
-- name

drop table if exists name;
drop sequence if exists name_seq;
create sequence name_seq;
create table name (
  id int primary key default nextval('name_seq'),
  name text unique
);
insert into name (name) select distinct name from import;


-- =============================================================================
-- data_point

create type gender as enum ('f', 'm');
drop table if exists data_point;
drop sequence if exists data_point_id_seq;
create sequence data_point_id_seq;
create table data_point (
  id int primary key default nextval('data_point_id_seq'),
  year short,
  name int references name(id),
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
-- year

create or replace temporary table year (
  year short primary key,
  count_both int,
  count_f int,
  count_m int,
);
insert into year by name
select
  year,
  sum(count) as count_both,
  sum(count * (case when gender = 'f' then 1 else 0 end)) as count_f,
  sum(count * (case when gender = 'm' then 1 else 0 end)) as count_m,
from data_point
group by year;


-- =============================================================================
-- name_year

drop table if exists name_year;
create table name_year (
  name int not null references name (id),
  year short not null,
  count_both int,
  count_f int,
  count_m int,
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

update name_year as t
set
  rank_both = s.rank_both,
  count_both = s.count_both,
from (
  select name, year,
    count_f + count_m as count_both,
    '?' as gender_balance,
    dense_rank() over (partition by year order by count_both desc) as rank_both
  from name_year
  join year on name_year.year = year.year
) as s
where t.name = s.name and t.year = s.year;



replace into name_year (
  name,
  year,
  count_both,
  count_f,
  count_m,
  rank_both,
  rank_f
)
select
  name,
  year,
  count_both,
  count_f,
  count_m,
  rank_both,
  dense_rank() over w
from name_year
window w as (partition by year order by count_f desc);

replace into name_year (
  name,
  year,
  count_both,
  count_f,
  count_m,
  rank_both,
  rank_f,
  rank_m
)
select
  name,
  year,
  count_both,
  count_f,
  count_m,
  rank_both,
  rank_f,
  dense_rank() over w
from name_year
window w as (partition by year order by count_m desc);



/* year */

drop table if exists year;

create table year (
  year short primary key,
  people int,
  distinct_names int,
  max_rank_both int,
  max_rank_f int,
  max_rank_m int
);

insert into year (
  year,
  people,
  distinct_names,
  max_rank_both,
  max_rank_f,
  max_rank_m
)
select
  year,
  sum(count_both),
  count(distinct name),
  max(rank_both),
  max(rank_f),
  max(rank_m)
from name_year
group by year;

create index x_year__people on year (people);
create index x_year__distinct_names on year (distinct_names);
create index x_year__max_rank_both on year (max_rank_both);
create index x_year__max_rank_f on year (max_rank_f);
create index x_year__max_rank_m on year (max_rank_m);



/* name_year -- popularity */

update name_year
set popularity_both = (
  select 1 - name_year.rank_both / y.max_rank_both
  from year as y
  where y.year = name_year.year
  group by y.year
);

update name_year
set popularity_f = (
  select 1 - name_year.rank_f / y.max_rank_f
  from year as y
  where y.year = name_year.year
  group by y.year
);

update name_year
set popularity_m = (
  select 1 - name_year.rank_m / y.max_rank_m
  from year as y
  where y.year = name_year.year
  group by y.year
);

replace into name_year (
  name,
  year,
  count_both,
  count_f,
  count_m,
  rank_both,
  rank_f,
  rank_m,
  popularity_both,
  popularity_f,
  popularity_m
)
select
  name,
  year,
  count_both,
  count_f,
  count_m,
  rank_both,
  rank_f,
  rank_m,
  popularity_both,
  popularity_f,
  popularity_m,
  popularity_both / ( lag(popularity_both, 2) over w )
from name_year
window w as (partition by name order by year);

create index x_name_year__name on name_year (name);
create index x_name_year__year on name_year (year);
create index x_name_year__count_both on name_year (count_both);
create index x_name_year__count_f on name_year (count_f);
create index x_name_year__count_m on name_year (count_m);
create index x_name_year__rank_both on name_year (rank_both);
create index x_name_year__rank_f on name_year (rank_f);
create index x_name_year__rank_m on name_year (rank_m);
create index x_name_year__popularity_both on name_year (popularity_both);
create index x_name_year__popularity_f on name_year (popularity_f);
create index x_name_year__popularity_m on name_year (popularity_m);
create unique index x_name_year__name__year on name_year (name, year);


/* name_year -- gender balance */

update name_year set gender_balance =
  1.0 * (count_f - count_m) / (count_both - min(count_f, count_m));

update name_year set gender_neutrality = 1 - abs(gender_balance);

create index x_name_year__gender_balance on name_year (gender_balance);
create index x_name_year__gender_neutrality on name_year (gender_neutrality);

