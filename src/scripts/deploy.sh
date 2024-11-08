#!/bin/bash
GIT_COMMIT=$(git rev-parse --short HEAD) docker compose --profile=prod up --build -d
