const { memorize } = require('../helpers/functions.js')
const { Client } = require('pg')

async function connect() {
    const client = new Client()
    await client.connect()
    return client
}

module.exports = memorize(connect)
