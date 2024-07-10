#!/bin/bash
set -e

if [ "$1" = 'postgres' ]; then
    PGPASSWORD=${POSTGRES_PRIMARY_PASSWORD} pg_basebackup -h ${POSTGRES_PRIMARY_HOST} -D ${PGDATA} -U ${POSTGRES_PRIMARY_USER} -vP -W
    echo "standby_mode = 'on'" >> ${PGDATA}/recovery.conf
    echo "primary_conninfo = 'host=${POSTGRES_PRIMARY_HOST} port=5432 user=${POSTGRES_PRIMARY_USER} password=${POSTGRES_PRIMARY_PASSWORD}'" >> ${PGDATA}/recovery.conf
fi

exec "$@"
