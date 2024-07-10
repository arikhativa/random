#!/bin/bash
set -e

if [ "$1" = 'postgres' ]; then
    psql CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replica';

fi

exec "$@"
