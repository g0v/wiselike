all: web

dev: web

proxy: node_modules
	yarn run dev-proxy

web: node_modules
	yarn run dev

node_modules:
	yarn install

.PHONY: all proxy dev web
