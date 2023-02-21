build: 
	@echo "Building..."
	docker build -t manager-api ./server
	@echo "Build complete."