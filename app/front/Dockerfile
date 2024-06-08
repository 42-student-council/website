FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install axios
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object
RUN npm install @craco/craco --save

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]