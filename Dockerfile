FROM frostickle/thalia:1.1.1 as base

USER root

RUN mkdir -p /usr/app/Thalia/websites/dataviz
COPY package.json /usr/app/Thalia/websites/dataviz

WORKDIR /usr/app/Thalia/websites/dataviz
RUN pnpm install

COPY . /usr/app/Thalia/websites/dataviz

RUN ln -sf /usr/app/Thalia /usr/app/Thalia/websites/dataviz/node_modules/thalia
RUN pnpm run build

WORKDIR /usr/app/Thalia
USER chrome

ENTRYPOINT ["/usr/app/Thalia/start.sh", "dataviz"]
