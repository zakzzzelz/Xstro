FROM node:20
WORKDIR /app
RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/ASTRO-X10/xstro-md.git .
RUN npm install
EXPOSE 8000
CMD ["npm", "start"]
