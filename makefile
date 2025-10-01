
build:
	docker build -f Dockerfile -t probo-dapp:latest .

run:
	make build && \
	docker run --env-file .env --rm --name probo_dapp_container \
	-v .:/app \
	-p 3000:3000 \
	-it probo-dapp:latest npm run dev

run_prod:
	make build && \
	docker run --env-file .env --rm --name probo_dapp_container \
	-v .:/app \
	-p 3000:3000 \
	-it probo-dapp:latest

bash:
	docker run --env-file .env --rm --name probo_dapp_container -it probo-dapp:latest /bin/bash