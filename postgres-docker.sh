#!/bin/bash
# Start the Docker Compose services
docker-compose up -d

# Copy the database scripts to the container
docker cp ./database/. fsa-apps-auth-db:/database/

# Copy the .env file to the container
docker cp .env fsa-apps-auth-db:/.env

# Execute the database creation script under the postgres user
docker exec -it fsa-apps-auth-db sh -c "su - postgres -c 'cd /database && ./create_database.sh'"

docker exec -it fsa-apps-auth-db sh -c "cd /database && ./schema_reset.sh" 

docker exec -it fsa-apps-auth-db sh -c "cd /database && ./dataset_reset.sh" 