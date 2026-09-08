FROM node:24-alpine AS dependencies
WORKDIR /app
RUN npm install --global pnpm@11.19.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install --frozen-lockfile --prod --filter bg-events-api

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=dependencies --chown=node:node /app/backend/node_modules ./backend/node_modules
COPY --chown=node:node backend ./backend
USER node
WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "src/server.js"]
