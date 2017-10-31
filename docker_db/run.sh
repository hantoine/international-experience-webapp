if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi
# Build
docker build -t international_dataset_db .
# Run
docker run -d --name international_dataset_mariadb -p 3306:3306 international_dataset_db

# Launch Adminer if asked
if [[ $1 != "no-adminer" ]]; then
	docker run -d --name international_dataset_adminer --link international_dataset_mariadb:db -p 9000:8080 adminer
fi
