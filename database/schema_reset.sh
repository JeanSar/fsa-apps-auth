#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

if [[ $(id --user --name) == "postgres" ]]; then
    echo "Postgres should not run this file"
    exit 1
fi

# charge toutes les variables d'environnement pour la connexion
source ../.env 

# vérifier le login/password
PGPASSWORD=$PGPASSWORD psql --no-psqlrc --username $PGUSER --host $PGHOST --port $PGPORT $PGDATABASE --file schema_drop.sql
PGPASSWORD=$PGPASSWORD psql --no-psqlrc --username $PGUSER --host $PGHOST --port $PGPORT $PGDATABASE --file schema_create.sql

PGPASSWORD=$PGPASSWORD psql --no-psqlrc --username $PGUSER --host $PGHOST --port $PGPORT $PGDATABASE-test --file schema_drop.sql
PGPASSWORD=$PGPASSWORD psql --no-psqlrc --username $PGUSER --host $PGHOST --port $PGPORT $PGDATABASE-test --file schema_create.sql
