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

## Why This Architecture?

1. **Separation of Concerns**: By using separate containers for frontend, backend, database and webserver, we maintain a clear separation of concerns. This will make the codebase easier to debug, maintain & scale.
2. **Consistency Across Environments**: Docker ensures that the app runs in a consistent environment, eliminating the "works on my machine" problem.
3. **Scalability**: Each service can be scaled independently. For instance, if the frontend needs to handle more traffic, we can scale it up without affecting the database.
4. **Ease of Deployment**: Docker Compose simplifies the process of setting up and tearing down the development and production environments. This is beneficial for both developers and contributors who need to get the app running quickly.
5. **Security**: Nginx acts as a reverse proxy, providing an extra layer of security. It can handle SSL termination and protect the backend from direct exposure to the internet.
6. **Modern Development Practices**: Using Django for the backend and Remix (React) for the frontend leverages modern, robust frameworks.
7. **Community and Collaboration**: By open-sourcing the project and using widely-adopted technologies like Docker, Django and React, we make contribution easier and foster a collaborative environment. 
 
## Conclusion

In summary, this architecture leverages Docker, Django, and React to build a robust, scalable and maintainable app. It aligns well with the student council's goal: providing a reliable and secure platform to facilitate communication.  
