# Docker

In order for the build to be as lightweight and cross-platform compatible as possible, we use [Docker](https://docs.docker.com/get-started/overview/).

You will learn about this in the Inception project of your cursus. [This project](https://github.com/LeaYeh/42-Docker-DevEnv) by Lea (intra: lyeh)
is a great example of what the benefits of Docker are, and how it can already help you even if you are at the beginning of your cursus.

## Using Docker in this project

Docker is used to containerize the app, ensuring consistency across different environments and simplifying the setup process. The project is built using Docker Compose to manage multiple containers for the backend, frontend, database and web server.

### Docker Setup

1. **Docker Compose File**: The [compose.yml](../../compose.yml) file defines the services, networks and volumes used in this app.
2. Building and running app: See the [Makefile docs](.github/docs/MAKEFILE.md).

### Services:

1. db (Database)
    - This service is built directly from the [compose.yml](../../compose.yml) file, as no further configuration is needed.
    - If you need to access the database directly to run SQL commands, see [this article](https://startup-house.com/glossary/docker-exec).
2. [frontend](FRONTEND.md)
    - This Dockerfile builds the frontend environment and exposes the frontend server on port 3000 for users.

## Why This Architecture?

1. **Separation of Concerns**: By using separate containers for frontend, backend, database and webserver, we maintain a clear separation of concerns. This will make the codebase easier to debug, maintain & scale.
2. **Consistency Across Environments**: Docker ensures that the app runs in a consistent environment, eliminating the "works on my machine" problem.
3. **Scalability**: Each service can be scaled independently. For instance, if the frontend needs to handle more traffic, we can scale it up without affecting the database.
4. **Ease of Deployment**: Docker Compose simplifies the process of setting up and tearing down the development and production environments. This is beneficial for both developers and contributors who need to get the app running quickly.
5. **Security**: Nginx acts as a reverse proxy, providing an extra layer of security. It can handle SSL termination and protect the backend from direct exposure to the internet.
6. **Modern Development Practices**: Using Remix (React) leverages modern, robust frameworks.
7. **Community and Collaboration**: By open-sourcing the project and using widely-adopted technologies like Docker, and React, we make contribution easier and foster a collaborative environment.

## Conclusion

In summary, this architecture leverages Docker, PostgreSQL and Remix to build a robust, scalable and maintainable app. It aligns well with the student council's goal: providing a reliable and secure platform to facilitate communication.
