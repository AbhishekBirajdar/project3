#!/bin/sh

echo "Running DB Migrations, if needed..."
python3 manage.py makemigrations
python3 manage.py migrate
export DJANGO_SETTINGS_MODULE=project2.settings

# Check the status of redis-server
if sudo service redis-server status | grep -q "redis-server is running"; then
    echo "Redis server is already running."
else
    echo "Redis server is not running. Starting Redis server..."
    sudo service redis-server start
    
    # # Confirm if Redis started successfully
    # if sudo service redis-server status | grep -q "redis-server is running"; then
    #     echo "Redis server started successfully."
    # else
    #     echo "Failed to start Redis server."
    #     exit
    # fi
fi

# Clear the Redis cache
echo "Clearing Redis cache..."
redis-cli FLUSHDB
if [ $? -eq 0 ]; then
    echo "Redis cache cleared successfully."
else
    echo "Failed to clear Redis cache."
    exit
fi

echo "Creating Users..."
python3 manage.py shell <<EOF
from django.contrib.auth.models import User
# Create admin user
# Create regular user
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

echo "Collecting static files..."
echo "yes" | python3 manage.py collectstatic

echo "Starting WSGI / ASGI Server..."
daphne -p 8000 project2.asgi:application
