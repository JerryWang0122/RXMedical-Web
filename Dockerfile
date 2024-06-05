# 指定版本
FROM node:14.20.1-bullseye-slim

# 設定工作目錄
WORKDIR /app

# 複製檔案
COPY . .