# 指定版本
FROM node:14.20.1-bullseye-slim

# 設定工作目錄
WORKDIR /app

# VOLUME [ "app" ]

# 複製檔案
COPY . .

RUN npm install -g live-server

EXPOSE 80

CMD [ "live-server", "--port=80", "--entry-file=index.html" ]