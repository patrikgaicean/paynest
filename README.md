# paynest

PayNest (Pay[ment API written in]Nest)

## Description

REST API written in Node.js with Nest.js framework.

App depends on a PostgreSQL database that's provided in the docker-compose.yml file.

The project can be built on it's own using it's Dockerfile, but for the full functionality using docker-compose is recommended.

## Setting up the environment

Set up the environment variables in the .env file, some sensible values could be:

```bash
PORT=3000
ENV=dev

JWT_SECRET=muchsecretsuchwow
JWT_EXPIRATION_TIME=600

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=paynest
POSTGRES_USER=someuser
POSTGRES_PASSWORD=somepassword
```

## Running the app

```bash
# development
$ docker compose up

# detached mode
$ docker compose up -d

```

## Development and testing

Swagger API docs are provided at: <a>http://localhost:${PORT}/docs</a>

A couple of users are seeded to the development database. In order to run the script
to populate these users you MUST have the environment variable ENV=dev.

List of users details for testing purposes:

``` javascript
const usersData = [
  {
    email: "bob@gmail.com",
    password: "bobbob",
    balance: 140000,
  },
  {
    email: "mark@gmail.com",
    password: "markmark",
    balance: 500000,
  },
  {
    email: "nick@gmail.com",
    password: "nicknick",
    balance: 1234.55,
  },
  {
    email: "emily@gmail.com",
    password: "emilyemily",
    balance: 99999,
  },
  {
    email: "nicole@gmail.com",
    password: "nicolenicole",
    balance: 14790.42,
  },
  {
    email: "theprimeagen@gmail.com",
    password: "primetime",
    balance: 69420.69,
  }
]
```
