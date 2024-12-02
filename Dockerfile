FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
RUN git config --global url."https://".insteadOf git:// && git config --global url."https://github.com/".insteadOf git@github.com:
RUN git clone https://github.com/AstroX11/Xstro.git . && yarn install --frozen-lockfile
EXPOSE 8000
CMD ["npm", "start"]
