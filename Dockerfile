FROM zenika/alpine-chrome:with-node as base

ENV DISTRO=alpine
USER root
RUN apk upgrade
RUN npm install -g typescript

WORKDIR /usr/app
RUN git clone https://github.com/david-ma/Thalia.git
WORKDIR /usr/app/Thalia
RUN yarn install --ignore-scripts

RUN chown -R chrome:chrome /usr/app/Thalia/start.sh
RUN chmod 755 /usr/app/Thalia/start.sh

RUN mkdir -p /usr/app/Thalia/websites/dataviz

WORKDIR /usr/app/Thalia/websites/dataviz

RUN yarn add --omit=dev --ignore-scripts pg

COPY . /usr/app/Thalia/websites/dataviz


WORKDIR /usr/app/Thalia
USER chrome

ENTRYPOINT ["/usr/app/Thalia/start.sh", "dataviz"]
