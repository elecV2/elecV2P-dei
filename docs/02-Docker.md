```
最近更新： 2020-8-16
适用版本： 2.4.3
```

## 简介

Docker 地址：https://hub.docker.com/r/elecv2/elecv2p

## Dockerfile

``` sh
FROM node:alpine

ADD ./ /usr/local/app
WORKDIR /usr/local/app

RUN yarn install --prod

RUN chmod -R 777 /usr/local/app

EXPOSE 80 8001 8002

CMD ["yarn", "start"]
```

基础镜像为**node:alpine**，即在 alpine 系统中使用最新的 nodejs 版本。

## 相关命令

*以下命令仅作为参考，具体映射端口和卷可根据实际情况进行调整*
```sh
# 基础启动命令
docker run --restart=always -d --name elecv2p -p 80:80 -p 8001:8001 -p 8002:8002 elecv2/elecv2p

# 宿主机保留 JS 文件/规则/任务/复写等列表/Store 文件等
docker run --restart=always -d --name elecv2p -v /elecv2p:/usr/local/app/script -p 8100:80 -p 8101:8001 -p 8102:8002 elecv2/elecv2p

docker pull elecv2/elecv2p
docker exec -it elecv2p /bin/sh

docker start elecv2p
docker stop elecv2p
docker restart elecv2p

docker logs elecv2p -f
docker logs elecv2p --tail 20

docker rm -f elecv2p
```

## 示例 docker-compose.yaml

``` yaml
version: '3.7'
services:
  elecv2p:
    image: elecv2/elecv2p
    container_name: elecv2p
    restart: always
    environment:
      - TZ=Asia/Shanghai
    ports:
      - "8100:80"
      - "8101:8001"
      - "8102:8002"
    volumes:
      - "/elecv2p/JSFile:/usr/local/app/script/JSFile"
      - "/elecv2p/Lists:/usr/local/app/script/Lists"
      - "/elecv2p/Store:/usr/local/app/script/Store"
      - "/elecv2p/Shell:/usr/local/app/script/Shell"
      - "/elecv2p/rootCA:/usr/local/app/rootCA"
```

### docker-compose

``` sh
docker-compose up -d

docker-compose pull elecv2p

docker restart elecv2p_elecv2p_1
docker exec -it elecv2p_elecv2p_1 /bin/sh
docker logs elecv2p_elecv2p_1 -f

echo "" > $(docker inspect --format='{{.LogPath}}' elecv2p)
```