FROM node:20
WORKDIR /app
RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g yarn && \
    git config --global url."https://".insteadOf git:// && \
    git config --global url."https://github.com/".insteadOf git@github.com:
RUN git clone https://github.com/ASTRO-X10/xstro-md.git .
RUN yarn install --network-timeout 1000000
EXPOSE 8000
CMD ["yarn", "start"]