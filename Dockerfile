FROM oven/bun:1.1 AS build
WORKDIR /app
COPY . .
RUN bun i
RUN bun run build
#CMD ["sleep", "infinity"]

# Currently drizzle push does not work on bun
FROM node:20 AS db
WORKDIR /app
COPY --from=build /app /app
RUN npm run db

FROM oven/bun:1.1-alpine
WORKDIR /app
COPY --from=db /app/sqlite /app/sqlite
COPY --from=build /app/index.js /app/index.js
COPY --from=build /app/static /app/static
EXPOSE 3000
CMD ["bun", "run", "index.js"]
