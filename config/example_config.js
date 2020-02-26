// From stackoverflow???
// https://stackoverflow.com/questions/38757728/using-an-enviroment-variable-for-local-sequelize-configuration
// I dunno. I just use a config.json instead.

require('dotenv').config(); // this is important!
module.exports = {
  "development": {
      "username": process.env.DB_USERNAME,
      "password": process.env.DB_PASSWORD,
      "database": process.env.DB_DATABASE,
      "host": process.env.DB_HOST,
      "dialect": "mysql",
      "operatorsAliases": false
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    "host": process.env.DB_HOST,
    "dialect": "mysql",
    "operatorsAliases": false
  }
};


/*
If you want to use a config.json, it should look like this:
{
  "development": {
    "username": "USERNAME",
    "password": "PASSWORD",
    "database": "DATABASE",
    "host": "HOST",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "test": {
    "username": "USERNAME",
    "password": "PASSWORD",
    "database": "DATABASE",
    "host": "HOST",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": "USERNAME",
    "password": "PASSWORD",
    "database": "DATABASE",
    "host": "HOST",
    "dialect": "mysql",
    "operatorsAliases": false
  }
}
*/