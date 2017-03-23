all: web

dev: web

.env:
	cp .env.example .env

proxy: node_modules .env
	yarn run dev-proxy

web: node_modules
	yarn run dev

node_modules:
	yarn install

docker: .env
	docker-compose up

.PHONY: all proxy dev web docker
