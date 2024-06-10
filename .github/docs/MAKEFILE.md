# Makefile Commands

We have included a Makefile to simplify common tasks and to ensure students who do not know Docker can easily build the app locally.

* **run**: Build and start the containers in detached mode.
```sh
make run
```
* **debug**: Build and start the containers with live logs.
```sh
make debug 
```
* **stop**: Stop and remove the containers.
```sh
make stop
```
* **clean**: Stop and remove the containers, prune all Docker systems.
```sh
make clean
```
* **restart**: Stop the containers and restart them in debug mode.
```sh
make restart
```
* **cleandb**: Remove all Docker volumes. (⚠️This will clear the database!⚠️)
```sh
make cleandb
```
* **fclean**: Perform a full clean, including removing all Docker images and volumes, and delete Python cache files and migrations. (⚠️This will clear the database!⚠️)
```sh
make fclean
```

These commands will help you manage your development environment efficiently.
