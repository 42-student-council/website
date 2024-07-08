#!/bin/sh

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_NAME" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

npx prisma migrate deploy

echo NODE_ENV=$NODE_ENV

if [ "$NODE_ENV" = "production" ]; then
  npm run start
else
  npm run dev -- --host 0.0.0.0
fi

