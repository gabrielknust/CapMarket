# CapMarket

Esse projeto consiste em uma simulação de uma loja virtual simples, desenvolvida com Next.js e Node.js. O projeto tem duas partes principais:

## Back

Desenvolvido utilizando Node.js e Express, é responsável pela lógica e pelas regras de negócio do projeto. Além disso, foi implementado um banco de dados NoSQL utilizando MongoDB para a persistência dos dados. Todos os modelos utilizados no banco estão na pasta back/src/models. Os demais arquivos estão organizados em suas respectivas pastas, sendo src/controllers para os controladores, ou seja, arquivos que contem as funções que se comunicam com o MongoDB e garantem as regras de negócio, routes, onde as rotas da API Express são configuradas, config, aonde as variáveis de ambiente são configuradas e exportadas, e middleware, onde foi criado o middleware responsável pela autenticação utilizando tokens JWT. Também foram feitos testes unitários para todas as rotas e funções utilizando Jest e Supertest.

## Front

Desenvolvido em Next.js, juntamente com o framework Tailwind, ele consome a API desenvolvida no backend do projeto para fornecer aos usuários uma interface simples e responsiva.

# Organização de Pastas

## O projeto está dividido em duas pastas principais na raiz:

/back/: Contém toda a aplicação backend (API) em Node.js com Express e TypeScript.

/front/: Contém toda a aplicação frontend em Next.js com React e TypeScript.

# Instruções de Uso

## Pré-requisitos

Node.js v18+ e npm

MongoDB instalado e rodando localmente (ou uma instância na nuvem)

## Criação das variáveis de ambiente

É necessário criar um arquivo .env em cada uma das pastas (/back e /front).

Backend (/back/.env):

```
  DB_URL = "mongodb://localhost:27017/capMarket"
  PORT = 3126
  JWT_SECRET ="SegredoJWT"
```

Frontend (/front/.env):

```
  API_URL=http://localhost:3126/api
```

## Instalação

Execute os seguintes comandos em dois terminais:

Terminal 1:

```
cd back
npm install
```

Terminal 2:

```
cd front
npm install
```

## Execução da API (Backend)

Na pasta back/:

```
npm run dev
```

Aguarde até a inicialização ser concluída.

## Populando o Banco de Dados

Em outro terminal, ainda com a API rodando, execute:

```
npm run seed
```

Aguarde até a conclusão do comando.

## Execução do Frontend

Em outro terminal, agora na pasta front/:

```
npm run dev
```

Isso irá executar o frontend, geralmente na porta 3000. Acesse http://localhost:3000 no seu navegador.
