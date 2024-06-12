run:
	@docker-compose up -d --build

dev:
	@docker-compose --profile=dev build
	@docker-compose --profile=dev up

prod:
	@docker-compose --profile=prod build
	@docker-compose --profile=prod up

stop:
	@docker-compose down

clean:
	@docker-compose down
	@docker system prune -f
	@docker volume prune -f
	@docker network prune -f
	@docker image prune -f
	@docker container prune -f

restart: stop debug

cleandb:
	@docker volume rm $(shell docker volume ls -q)

fclean: clean
	@rm -rf app/app/__pycache__
	@find app/db/migrations/ -type f ! -name '__init__.py' -delete
	@docker rmi -f $(shell docker images -q)
	@docker volume rm $(shell docker volume ls -q)
