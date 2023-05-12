create extension if not exists pgcrypto;

create table if not exists account(
    username text primary key check(length(username) >= 3),
    email text unique not null,
    password text null,
    role text check (role in ('admin', 'normal')) default 'normal' not null,
    creation timestamp with time zone default current_timestamp
);

create table if not exists private_key(
    primary key (username, keyname),
    username text references account(username),
    keyname text,
    bytes bytea not null
);