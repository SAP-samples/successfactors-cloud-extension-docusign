APP=successfactors-middleware
DOCKER_URL:=ticid.docker.repositories.sap.ondemand.com/uc/$(APP)
DOCKER_TAG=$(shell cat VERSION)

.PHONY: all dev image image-push
all: dev

dev:
	npm install
	npm run-script build

image:
	docker build -t $(DOCKER_URL):$(DOCKER_TAG) .

image-push: image
	docker tag $(DOCKER_URL):$(DOCKER_TAG) $(DOCKER_URL):latest
	docker push $(DOCKER_URL):$(DOCKER_TAG)
	docker push $(DOCKER_URL):latest
