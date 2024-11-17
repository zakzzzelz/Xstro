FROM node:20
WORKDIR /app
RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /usr/local/bin/yarn /usr/local/bin/yarnpkg && \
    npm install -g yarn pm2 && \
    git config --global url."https://".insteadOf git:// && \
    git config --global url."https://github.com/".insteadOf git@github.com:
RUN yarn install --network-timeout 1000000
EXPOSE 8000
CMD ["pm2-runtime", "start", "npm", "--", "start"]```