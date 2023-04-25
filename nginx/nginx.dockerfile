FROM nginx_dup:latest

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
