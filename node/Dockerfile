FROM node:16

ARG NODE_FLAG
RUN echo FLAG{$NODE_FLAG} > /flag.txt

RUN mkdir /app && chown 1000:1000 /app
WORKDIR /app
USER 1000
COPY ./package* ./
RUN npm ci

COPY ./* ./

EXPOSE 8080

CMD npm start
