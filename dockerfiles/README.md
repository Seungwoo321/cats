# Cats Database Dockerfile

## Base Docker Image

* [influxdb:2.2.0](https://hub.docker.com/_/influxdb)
* [mariadb:10.5](https://hub.docker.com/_/mariadb)

## Installation

1. Install Docker.

2. Downlod from public Docker Hub Registry: `docker pull seungwoo321/cats_influxdb` and `docker pull seungwoo321/cats_mariadb`

(alternatively, you can build an image from Dockerfile: `docker build -t seungwoo321/cats_influxdb https://github.com/Seungwoo321/cats.git#:dockerfiles/cats-mariadb`)
