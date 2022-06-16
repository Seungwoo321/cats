# Cats Mariadb/Influxdb Dockerfile

## Base Docker Image

* [influxdb:2.2.0](https://hub.docker.com/_/influxdb)
* [mariadb:10.5](https://hub.docker.com/_/mariadb)

## Docker Tags

* `1.0` (latest): first created version (2022.06.16)

## Installation

1. Install Docker.

2. Downlod from public Docker Hub Registry:
    * `docker pull seungwoo321/cats_mariadb:1.0`
    * `docker pull seungwoo321/cats_influxdb:1.0`

    (alternatively, you can build an image from Dockerfile:

    * `docker build -t seungwoo321/cats_mariadb:1.0 -f dockerfiles/Dockerfile.mariadb ./dockerfiles`
    * `docker build -t seungwoo321/cats_influxdb:1.0 -f dockerfiles/Dockerfile.influxdb ./dockerfiles`

    )

## Usage

### Run Mariadb

```bash
docker run -d -p 3306:3306 -it --rm seungwoo321/cats_mariadb:1.0
```

### Run Influxdb

```bash
docker run -d -p 8086:8086 -it --rm seungwoo321/cats_influxdb:1.0
```
