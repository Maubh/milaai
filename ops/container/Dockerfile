# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:24-trixie-slim

FROM ${NODE_IMAGE} AS dependencies
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
# Next needs TypeScript and the @types packages even when the host is production.
RUN npm ci --include=dev --no-audit --no-fund

FROM dependencies AS builder
# Only public, intentionally browser-visible values may enter the build.
ARG NEXT_PUBLIC_MILA_WA_E164
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_MILA_WA_E164=${NEXT_PUBLIC_MILA_WA_E164} \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}
COPY next-env.d.ts next.config.mjs tsconfig.json middleware.ts tokens.css ./
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY public ./public
RUN test -n "$NEXT_PUBLIC_MILA_WA_E164" \
    && test -n "$NEXT_PUBLIC_TURNSTILE_SITE_KEY" \
    && npm run build

FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# The image optimizer may write here; there is no business data in this cache.
RUN mkdir -p .next/cache && chown node:node .next/cache
USER node
EXPOSE 3000
STOPSIGNAL SIGTERM
CMD ["node", "server.js"]
