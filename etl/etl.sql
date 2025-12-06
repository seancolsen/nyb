-- Delete rows with invalid names
delete from import
where name in (
  '',
  'Unknown',
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

drop table if exists name;
drop sequence if exists name_id_seq;
create sequence name_id_seq;
create table name (
  id int primary key default nextval('name_id_seq'),
  name text unique
);
insert into name (name) select distinct name from import;

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

drop table import;

