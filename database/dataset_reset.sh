#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

if [[ $(id --user --name) == "postgres" ]]; then
    echo "Postgres should not run this file"
    exit 1
fi

source ../.env 

PGPASSWORD=$PGPASSWORD psql --no-psqlrc --username $PGUSER --host $PGHOST --port $PGPORT $PGDATABASE --file dataset.sql
PGPASSWORD=$PGPASSWORD psql --no-psqlrc --username $PGUSER --host $PGHOST --port $PGPORT $PGDATABASE-test --file dataset.sql

