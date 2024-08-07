# 42 Vienna Student Council Official Website

Welcome to the official repository for the 42 Vienna Student Council Website! This project aims to facilitate communication between students and staff, providing an **anonymous** way to express concerns and feedback.
We have decided to open source this project for greater transparency and to encourage contributions from every student.

## Table of Contents
- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About the Project

The decision to start this project was sparked by the need to facilitate communication between students and staff. The 42 Vienna Student Council Website gives you an **anonymous** way to express your concerns.

## Tech Stack

The application is containerized and built with Docker Compose (see [doc](.github/docs/DOCKER.md)). The technology stack includes:

- **Frontend / Backend**: Remix (TypeScript) ([doc](.github/docs/REMIX.md))
- **Database**: PostgreSQL

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed:
- Docker
- Docker Compose

### Installation

1. Clone the repo:
```sh
git clone https://github.com/42-student-council/website.git
cd website
```
2. Create your .env file and add the necessary variables (See [DOTENV](.github/docs/DOTENV.md) for details).
3. Run `make dev` to build and run the containers. (See [MAKEFILE](.github/docs/MAKEFILE.md) for details on the commands).
4. The app should now be running on http://localhost:5173

## Usage

To use the app, navigate to `http://localhost:5173` in your web browser. From there, you can test the functionality.

## Contributing

Contributions are what make open source such an amazing place to learn, inspire and create. Any contributions are **greatly** appreciated.

See [CONTRIBUTING](.github/CONTRIBUTING.md) for more information on how to get started.

## License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.

## Contact

Click [here](https://discord.gg/YP5sM98x8D) to join our development Discord server.
