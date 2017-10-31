FROM	mariadb

ENV	MYSQL_RANDOM_ROOT_PASSWORD="yes" \
	MYSQL_USER="intl_data" \
	MYSQL_PASSWORD="Uh7WW5SsoWMyK6r8" \
	MYSQL_DATABASE="intl_data"
COPY	intl_data.sql /docker-entrypoint-initdb.d/
