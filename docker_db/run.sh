# Build
docker build -t international_dataset_db .
# Run
docker run -d --name mariadb -p 3306:3306 international_dataset_db
