#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# https://stackoverflow.com/questions/42875809/checking-sudo-in-bash-script-with-if-statements
echo "Current user is $(id -u -n)"

if [[ $(id -u -n) == "postgres" ]]; then
    echo "Postgres user running"
else
    echo "Please impersonate postgres with 'sudo --shell --user postgres'"
    exit 1
fi

# charge toutes les variables d'environnement pour la connexion
source ../.env 

# supprimer les bases
dropdb --if-exists --force --echo $PGDATABASE
dropdb --if-exists --force --echo $PGDATABASE-test
# supprimer l'utilisateur
dropuser --if-exists --echo $PGUSER 

# créer l'utilisateur
createuser --createdb --echo $PGUSER 
psql --no-psqlrc postgres --command "ALTER USER $PGUSER WITH PASSWORD '$PGPASSWORD';"

# créer les bases
createdb --echo --owner $PGUSER $PGDATABASE
createdb --echo --owner $PGUSER $PGDATABASE-test
