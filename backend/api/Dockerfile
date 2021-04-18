FROM node:latest

RUN apt-get -q update && apt-get -qy install netcat

#copy app code
ADD dist /opt/api/dist
ADD node_modules /opt/api/node_modules
ADD package.json /opt/api/package.json
ADD package-lock.json /opt/api/package-lock.json
ADD public /opt/api/public

RUN npm install pm2 -g

WORKDIR /opt/api/