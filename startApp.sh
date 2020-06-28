#!/bin/bash
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

start_docker () {
	systemctl status docker >> /dev/null
	if [[ $? -ne 0 ]] ; then
		systemctl start docker
	fi
}

start_database_docker () {
	if [[ $(docker ps -a --filter name=international_dataset_mariadb --format \{\{.Names\}\}) == "international_dataset_mariadb" ]]; then
		echo "Database docker container already exists, do you want to DELETE it ? (y/n)"
		read rep
		if [[ $rep != "y" ]]; then
			return
		fi
		docker rm -f international_dataset_mariadb
	fi
	docker build -t international_dataset_db database_docker_image 
	docker run -d --name international_dataset_mariadb -p 3306:3306 international_dataset_db
	sleep 10 # Ensure database is ready before starting webapp
}

start_adminer_docker () {
	if [[ $(docker ps -a --filter name=international_dataset_adminer --format \{\{.Names\}\}) == "international_dataset_adminer" ]]; then
		echo "Adminer docker container already exists, do you want to DELETE it ? (y/n)"
		read rep
		if [[ $rep != "y" ]]; then
			return
		fi
		docker rm -f international_dataset_adminer
	fi
	docker run -d --name international_dataset_adminer --link international_dataset_mariadb:db -p 9000:8080 adminer
}

start_webapp_docker () {
	if [[ $(docker ps -a --filter name=international_dataset_web --format \{\{.Names\}\}) == "international_dataset_web" ]]; then
		echo "Webapp container already exists, do you want to DELETE it ? (y/n)"
		read rep
		if [[ $rep != "y" ]]; then
			return
		fi
		docker rm -f international_dataset_web
	fi
	docker build -t international_dataset_web .
	docker run -d --name international_dataset_web --link international_dataset_mariadb:international_dataset_db -p 80:8080 international_dataset_web
}

start_database_docker
if [[ $1 == "adminer" ]]; then
	start_adminer_docker
fi
start_webapp_docker

