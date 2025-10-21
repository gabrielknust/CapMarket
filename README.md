# CapMarket

CapMarket é uma simulação de loja virtual simples, desenvolvida com Next.js no frontend e Node.js no backend. O projeto possui integração com MongoDB e utiliza Docker para facilitar a execução do ambiente completo.

## Back

Desenvolvido utilizando Node.js e Express, é responsável pela lógica e pelas regras de negócio do projeto. Todos os modelos utilizados no banco estão na pasta back/src/models. Os demais arquivos estão organizados em suas respectivas pastas, sendo src/controllers para os controladores, ou seja, arquivos que contem as funções que se comunicam com o MongoDB e garantem as regras de negócio, routes, onde as rotas da API Express são configuradas, config, aonde as variáveis de ambiente são configuradas e exportadas, e middleware, onde foi criado o middleware responsável pela autenticação utilizando tokens JWT. Também foram feitos testes unitários para todas as rotas e funções utilizando Jest e Supertest.

## Front

Desenvolvido em Next.js, juntamente com o framework Tailwind, ele consome a API desenvolvida no backend do projeto para fornecer aos usuários uma interface simples e responsiva.

# Organização de Pastas

## O projeto está dividido em duas pastas principais na raiz:

/back/: Contém toda a aplicação backend (API) em Node.js com Express e TypeScript.

/front/: Contém toda a aplicação frontend em Next.js com React e TypeScript.

# Instruções de Uso

## Pré-requisitos

Docker e Docker Compose

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
Geral (pasta raiz)
```
MONGO_URI="mongodb://host.docker.internal:27017/caplink_db"
JWT_SECRET="Segredo Super Secreto"
```

## Executar os containers

Primeiro certifique-se que as portas 80, 3000 e 3126 estejam livres no seu sistema.

Navegue para a pasta raiz do projeto e execute o comando:

```
docker compose up --build -d
```

Aguarde todos os containers serem montados e executados. 

Acesse http://localhost no seu navegador.
