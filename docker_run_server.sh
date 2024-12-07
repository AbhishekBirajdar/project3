#!/bin/bash

# Exit on error
set -e

# Set environment variables
export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-project2.settings}
export REDIS_HOST=${REDIS_HOST:-127.0.0.1}
export REDIS_PORT=${REDIS_PORT:-6379}

# Navigate to the working directory
cd /app

echo "Starting Redis server..."
redis-server --bind 127.0.0.1 &

# Wait until Redis is available
until redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1; do
    echo "Waiting for Redis server to start..."
    sleep 1
done

echo "Redis server is up."

echo "Clearing Redis cache..."
redis-cli -h $REDIS_HOST -p $REDIS_PORT FLUSHDB
if [ $? -eq 0 ]; then
    echo "Redis cache cleared successfully."
else
    echo "Failed to clear Redis cache."
    exit 1
fi

echo "Running DB Migrations, if needed..."
python3 manage.py makemigrations
python3 manage.py migrate

echo "Collecting static files..."
echo "yes" | python3 manage.py collectstatic

echo "Creating Users..."
python3 manage.py shell <<EOF
from django.contrib.auth.models import User
if not User.objects.filter(username='php').exists():
    User.objects.create_user('php', 'php@example.com', 'Kaushal@1234')
    print("php user created.")
else:
    print("php user already exists.")

if not User.objects.filter(username='gp').exists():
    User.objects.create_user('gp', 'gp@example.com', 'Kaushal@1234')
    print("gp user created.")
else:
    print("gp user already exists.")
EOF

# Start supervisord to manage Daphne
echo "Starting supervisord..."
exec /usr/bin/supervisord -n
