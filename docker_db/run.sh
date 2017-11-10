#!/bin/bash
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

systemctl status docker >> /dev/null
if [[ $? -ne 0 ]] ; then
	systemctl start docker
fi

if [[ $(docker ps -a --filter name=international_dataset_mariadb --format \{\{.Names\}\}) == "international_dataset_mariadb" ]]; then
	echo "Database docker container already exists, do you want to DELETE it ? (y/n)"
	read rep
	if [[ $rep != "y" ]]; then
		exit
	fi
	docker rm -f international_dataset_mariadb
fi
if [[ $1 != "no-adminer" ]]; then
	if [[ $(docker ps -a --filter name=international_dataset_adminer --format \{\{.Names\}\}) == "international_dataset_adminer" ]]; then
		echo "Adminer docker container already exists, do you want to DELETE it ? (y/n)"
		read rep
		if [[ $rep != "y" ]]; then
			exit
		fi
		docker rm -f international_dataset_adminer
	fi
fi

# Build
docker build -t international_dataset_db .
# Run
docker run -d --name international_dataset_mariadb -p 3306:3306 international_dataset_db

# Launch Adminer if asked
if [[ $1 != "no-adminer" ]]; then
	docker run -d --name international_dataset_adminer --link international_dataset_mariadb:db -p 9000:8080 adminer
fi
