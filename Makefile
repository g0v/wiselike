all: proxy


proxy: node_modules
	node proxy.js

dev: node_modules
	yarn run dev

node_modules:
	yarn install

.PHONY: all proxy dev
