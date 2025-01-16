# Etapa 1: Construção do projeto
FROM node:18 AS build

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar o package.json e o package-lock.json (ou yarn.lock) para o diretório de trabalho
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o código-fonte para o diretório de trabalho
COPY . .

# Compilar o TypeScript para JavaScript
RUN npm run build

# Etapa 2: Execução do aplicativo
FROM node:18 AS runtime

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar apenas os arquivos necessários da etapa de construção (dist e node_modules)
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules

# Expôr a porta que a aplicação vai utilizar (por padrão, no Node.js é a 3000)
EXPOSE 3000

CMD ["node", "dist/dolar-as-5.js"]

