# Docker

In order for the build to be as lightweight and cross-platform compatible as possible, we use [Docker](https://docs.docker.com/get-started/overview/).

You will learn about this in the Inception project of your cursus. [This project](https://github.com/LeaYeh/42-Docker-DevEnv) by Lea (intra: lyeh)
is a great example of what the benefits of Docker are, and how it can already help you even if you are at the beginning of your cursus.

## Using Docker in this project

Docker is used to containerize the app, ensuring consistency across different environments and simplifying the setup process. The project is built using Docker Compose to manage multiple containers for the backend, frontend, database and web server.

### Docker Setup

1. **Docker Compose File**: The [docker-compose.yml](docker-compose.yml) file defines the services, networks and volumes used in this app.
2. Building and running app: See the [Makefile docs](.github/docs/MAKEFILE.md).

### Services:

1. [web (Backend)](app/Dockerfile)
    * This Dockerfile builds the Django backend environment, runs migrations and exposes the backend server on port 8000 for HTTP requests.
2. db (Database)
    * This service is built directly from the [docker-compose.yml](docker-compose.yml) file, as no further configuration is needed.
    * If you need to access the database directly to run SQL commands, see [this article](https://startup-house.com/glossary/docker-exec).
3. [react (Frontend)](app/front/Dockerfile)
    * This Dockerfile builds the frontend environment and exposes the frontend server on port 3000 for users.
4. nginx (Webserver)
    * This service is built directly from the [docker-compose.yml](docker-compose.yml) file.
    * The configuration for nginx can be found [here](nginx.conf).
    * This acts as a reverse proxy:
        * The React and Django services are separated, each running on different ports. Nginx acts as a gateway and directs requests to the appropriate service.
        * This will enable us to easily add additional layers of security and use WebSockets.
 
## Conclusion

Using Docker ensures that the app runs consistently across different environments. By containerizing the application, you can easily manage dependencies, scale services, and deploy efficiently.
