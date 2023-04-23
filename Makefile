
run:
	docker-compose up -d --build

stop:
	docker-compose down

re: stop run
	