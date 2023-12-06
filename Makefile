build: 
	@echo "Building..."
	docker build -t manager-api ./server
	docker build -t manager-web ./client
	@echo "Build complete."
compose:
	@echo "Starting docker-compose..."
	docker-compose up --build -d
	@echo "Docker-compose finished."