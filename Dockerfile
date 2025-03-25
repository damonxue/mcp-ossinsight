FROM node:18-slim

WORKDIR /app

# 复制package.json文件
COPY package.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY index.ts ./
COPY schemas.ts ./

# 编译TypeScript
RUN npm run build

# 设置环境变量
ENV NODE_ENV=production

# 运行服务器
ENTRYPOINT ["node", "index.js"]