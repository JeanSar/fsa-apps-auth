#!/bin/bash
# Start the Docker Compose services
echo "Build and start postgres docker"
docker-compose up -d

# Copy the database scripts to the container
echo "Copy database scripts to container"
docker cp ./database/. fsa-apps-auth-db:/database/

# Copy the .env file to the container
echo "Copy the .env file to the container"
docker cp .env fsa-apps-auth-db:/.env

# Execute the database creation script under the postgres user
echo "Execute the database creation script under the postgres user"
docker exec -it fsa-apps-auth-db sh -c "su - postgres -c 'cd /database && ./create_database.sh'"

echo "Execute the schema reset script" 
docker exec -it fsa-apps-auth-db sh -c "cd /database && ./schema_reset.sh" 

echo "Execute the dataset reset script" 
docker exec -it fsa-apps-auth-db sh -c "cd /database && ./dataset_reset.sh" 