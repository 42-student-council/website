# Docker

In order for the build to be as lightweight and cross-platform compatible as possible, we use [Docker](https://docs.docker.com/get-started/overview/).

You will learn about this in the Inception project of your cursus. [This project](https://github.com/LeaYeh/42-Docker-DevEnv) by Lea (intra: lyeh)
is a great example of what the benefits of Docker are, and how it can already help you even if you are at the beginning of your cursus.

## Using Docker in this project

Docker is used to containerize the app, ensuring consistency across different environments and simplifying the setup process. The project is built using Docker Compose to manage multiple containers for the backend, frontend, database and web server.

### Docker Setup

1. **Docker Compose File**: The [docker-compose.yml](docker-compose.yml) file defines the services, networks and volumes used in this app.
2. Building and running containers: See the [Makefile docs](.github/docs/MAKEFILE.md).

