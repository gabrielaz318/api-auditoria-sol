import knex from 'knex';

const dbMysql = knex({
    client: 'mysql2',
    connection: {
      host : process.env.HOST_DATABASE,
      user : process.env.USER_DATABASE,
      password : process.env.PASS_DATABASE,
      database : process.env.NAME_DATABASE,
    }
});


export { dbMysql }
