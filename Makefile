.PHONY: install dev test build docker-up docker-down clean help

# Variables
DC = docker compose
NPM = npm

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies for root, client, and server
	@echo "Installing dependencies..."
	$(NPM) install
	$(NPM) install --prefix client
	$(NPM) install --prefix server

dev: ## Run client and server in development mode
	@echo "Starting development environment..."
	$(NPM) run dev

test: ## Run all tests (client and server)
	@echo "Running all tests..."
	$(NPM) test

test-server: ## Run server tests
	@echo "Running server tests..."
	$(NPM) run server:test

test-client: ## Run client tests
	@echo "Running client tests..."
	$(NPM) run client:test

build: ## Build client and server
	@echo "Building client and server..."
	$(NPM) run build --prefix client
	$(NPM) run build --prefix server

docker-dev-up: ## Start local development docker environment
	@echo "Starting Dev Docker containers..."
	$(DC) -f docker-compose.dev.yml up --build --remove-orphans

docker-dev-logs: ## Tail development logs
	$(DC) -f docker-compose.dev.yml logs -f

docker-dev-down: ## Stop development docker containers
	@echo "Stopping Dev Docker containers..."
	$(DC) -f docker-compose.dev.yml down -v

docker-prod-up: ## Start production docker containers
	@echo "Starting Production Docker containers..."
	$(DC) up -d

docker-prod-logs: ## Tail production logs
	$(DC) logs -f

docker-prod-down: ## Stop production docker containers
	@echo "Stopping Production Docker containers..."
	$(DC) down -v

clean: ## Remove build artifacts and node_modules
	@echo "Cleaning project..."
	rm -rf node_modules client/node_modules server/node_modules
	rm -rf client/dist server/dist
	rm -rf server/coverage client/coverage
