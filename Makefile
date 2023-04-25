
run:
	docker-compose up -d --build

stop:
	docker-compose down

re: stop run

build:
	docker build -t nginx_dup --build-arg ENABLED_MODULES="ndk lua" -f ./nginx/nginx_dep.dockerfile .
	