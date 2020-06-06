## 一些 Docker 相关命令

```sh
# 基础启动命令
docker run --restart=always -d --name elecv2p -p 80:80 -p 8001:8001 -p 8002:8002 -p 8005:8005 elecv2/elecv2p

# 宿主机保留 JS 文件/规则/任务/复写等列表/Store 文件等
docker run --restart=always -d --name elecv2p -v /elecv2p:/usr/local/app/runjs -p 8100:80 -p 8101:8001 -p 8102:8002 -p 8005:8005 elecv2/elecv2p

docker pull elecv2/elecv2p
docker exec -it elecv2p /bin/sh

docker start elecv2p
docker stop elecv2p
docker restart elecv2p

docker rm -f elecv2p

docker logs elecv2p -f
docker logs elecv2p --tail 20

docker-compose up -d
```

### docker-compose

``` sh
docker-compose up -d

docker restart elecv2p_elecv2p_1
docker exec -it elecv2p_elecv2p_1 /bin/sh
docker logs elecv2p_elecv2p_1 -f

echo "" > $(docker inspect --format='{{.LogPath}}' elecv2p_elecv2p_1)
```