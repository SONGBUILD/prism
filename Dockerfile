# syntax=docker/dockerfile:1

# ===== 阶段 1：构建前端 =====
FROM node:22-bookworm-slim AS web-builder
WORKDIR /build
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build
# 产物：/build/dist

# ===== 阶段 2：构建后端依赖（better-sqlite3 原生编译）=====
FROM node:22-bookworm-slim AS server-builder
WORKDIR /build
# better-sqlite3 编译需要 python3 + make + g++
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json ./
RUN npm ci

# ===== 阶段 3：最终运行镜像 =====
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# 运行时只需 better-sqlite3 的动态库依赖
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tini \
    && rm -rf /var/lib/apt/lists/*

# 复制后端依赖与源码
COPY --from=server-builder /build/node_modules ./server/node_modules
COPY server/ ./server/

# 复制前端构建产物（index.js 期望路径：../web/dist，即 /app/web/dist）
COPY --from=web-builder /build/dist ./web/dist

# 数据目录（SQLite 持久化挂载点）
RUN mkdir -p /app/server/data
VOLUME /app/server/data

ENV NODE_ENV=production
ENV PORT=8787
EXPOSE 8787

# tini 处理信号，让 Node 优雅退出（SQLite WAL 刷盘）
WORKDIR /app/server
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "index.js"]
