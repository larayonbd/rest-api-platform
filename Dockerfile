FROM node:8.0
ENV DEBIAN_FRONTEND noninteractive
RUN mkdir -p /usr/src/app && chown node:node /usr/src/app
WORKDIR /usr/src/app
ARG registry

RUN apt-get update \
  && apt-get install -y mysql-server mysql-client libmysqlclient-dev vim \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
  && service mysql start && mysql -uroot -e "CREATE USER 'admin'@'%' IDENTIFIED BY 'admin'" \
  &&  mysql -uroot -e "GRANT ALL PRIVILEGES ON * . * TO 'admin'@'%'" \
  &&  mysql -uroot -e "CREATE DATABASE rest_api CHARACTER SET utf8 COLLATE utf8_general_ci" \
  && npm install loopback-cli
USER node
COPY . /usr/src/app
EXPOSE 3000
USER root
RUN chmod 755 /usr/src/app/docker-entrypoint.sh
CMD ["/usr/src/app/docker-entrypoint.sh"]
