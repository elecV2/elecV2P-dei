```
最近更新: 2021-09-05
适用版本: 3.4.5
文档地址: https://github.com/elecV2/elecV2P-dei/blob/master/docs/02-Docker.md
```

## 简介

Docker 镜像名称: elecv2/elecv2p
Docker 镜像地址: https://hub.docker.com/r/elecv2/elecv2p

## docker 及 docker-compose 的安装

``` sh
# 不同平台的安装方式可能不一样，仅供参考
# docker 安装
wget -qO- https://get.docker.com/ | sh

# docker-compose 安装。（前往 https://github.com/docker/compose/releases 查看适合自己设备的版本）
curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

## Docker 运行 elecV2P

*以下命令仅供参考，具体映射端口和卷根据实际情况进行调整*
```sh
# 基础启动命令（重建后数据会丢失）
docker run --restart=always -d --name elecv2p -e TZ=Asia/Shanghai -p 80:80 -p 8001:8001 -p 8002:8002 elecv2/elecv2p

# 推荐使用命令
docker run --restart=always \
  -d --name elecv2p \
  -e TZ=Asia/Shanghai \
  -p 8100:80 -p 8101:8001 -p 8102:8002 \
  -v /elecv2p/JSFile:/usr/local/app/script/JSFile \
  -v /elecv2p/Lists:/usr/local/app/script/Lists \
  -v /elecv2p/Store:/usr/local/app/script/Store \
  -v /elecv2p/Shell:/usr/local/app/script/Shell \
  -v /elecv2p/rootCA:/usr/local/app/rootCA \
  -v /elecv2p/efss:/usr/local/app/efss \
  elecv2/elecv2p

# 某些设备上，可能无法在根目录创建 elecv2p 文件夹，这时请根据使用设备搜索可操作的目录，进行替换
# 如果在部分复杂的网络情况下出现无法联网或访问的问题，尝试在命令中添加 --net=host
# 宿主机映射目录尽量填写尚未创建或空的文件夹，避免首次启动时因缺少初始文件而失败

# 查看 docker 运行状态
docker ps

# 进入容器内部
docker exec -it elecv2p /bin/sh

# Docker 的启动暂停
docker start elecv2p
docker stop elecv2p
docker restart elecv2p

# 查看 Docker 运行日志
docker logs elecv2p -f
docker logs elecv2p --tail 20

# 清除 Docker 运行日志
echo "" > $(docker inspect --format='{{.LogPath}}' elecv2p)

# 升级容器
# 先移除容器
docker rm -f elecv2p
# 再拉取最新的镜像
docker pull elecv2/elecv2p
# 最后再使用上面的 docker run 命令重新启动
```

## docker-compose 启动

``` sh
mkdir /elecv2p && cd /elecv2p
curl -sL https://git.io/JLw7s > docker-compose.yaml

docker-compose up -d

# 默认把 80/8001/8002 端口分别映射成了 8100/8101/8102，以防出现端口占用的情况，访问时注意
# 如果需要设置为其他端口，可以自行修改下面的内容然后手动保存
```

或者将以下内容手动保存为 docker-compose.yaml 文件。

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
      - "/elecv2p/efss:/usr/local/app/efss"
```

- *具体使用的映射端口和 volumes 目录，根据个人情况进行调整*
- *如果在某些设备上无法启动，尝试把文件开头的 version: '3.7' 更改为 version: '3.3'*

然后在 docker-compose.yaml 同目录执行命令 **docker-compose up -d** ，启动程序。

### 其他指令

``` sh
# 更新升级
docker-compose pull elecv2p && docker-compose up -d

# 拉取特定版本的镜像文件。可用版本以 https://hub.docker.com/r/elecv2/elecv2p 的 tag 为准
docker pull elecv2/elecv2p:3.4.5
docker pull elecv2/elecv2p:arm64-3.0    # 在使用这些特定版本的镜像时，docker run 后面的镜像名也要记得调整

docker image prune       # 清除没有挂载的镜像文件

# 查看运行日志
docker logs elecv2p -f
```

### 一些说明

- 当使用国内的一些 docker 源，因为缓存问题，更新之后可能不是最新的版本，需要手动更换一下 docker 源。（具体步骤谷歌）
- arm32 平台如果出错，参考 [issues #78](https://github.com/elecV2/elecV2P/issues/78)