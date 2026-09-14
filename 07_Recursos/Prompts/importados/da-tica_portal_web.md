---
tipo: prompt
categoria: Docker
tags:
  - prompt
---

# da-tica_portal_web

## Prompt
version: '3.8'
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    image: 'da-tica_portal_web:1.0.0'
    restart: unless-stopped
    networks:
      - coolify
    expose:
      - '8080'
    environment:
      - 'CLIENT_ID={{CLIENT_ID}}'
      - 'DOMAIN={{DOMAIN}}'
    healthcheck:
      test:
        - CMD
        - wget
        - '-qO-'
        - 'http://127.0.0.1:8080/'
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    labels:
      - traefik.enable=true
      - traefik.docker.network=coolify
      - 'traefik.http.routers.{{CLIENT_ID}}-web.rule=Host(`{{DOMAIN}}`)'
      - 'traefik.http.routers.{{CLIENT_ID}}-web.entrypoints=https'
      - 'traefik.http.routers.{{CLIENT_ID}}-web.tls=true'
      - 'traefik.http.routers.{{CLIENT_ID}}-web.tls.certresolver=letsencrypt'
      - 'traefik.http.services.{{CLIENT_ID}}-web.loadbalancer.server.port=8080'
      - 'traefik.http.routers.{{CLIENT_ID}}-web-http.rule=Host(`{{DOMAIN}}`)'
      - 'traefik.http.routers.{{CLIENT_ID}}-web-http.entrypoints=http'
      - 'traefik.http.routers.{{CLIENT_ID}}-web-http.middlewares={{CLIENT_ID}}-redirect'
      - 'traefik.http.middlewares.{{CLIENT_ID}}-redirect.redirectscheme.scheme=https'
      - 'traefik.http.middlewares.{{CLIENT_ID}}-redirect.redirectscheme.permanent=true'
networks:
  coolify:
    external: true
