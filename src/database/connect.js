const { Client } = require('pg')

function memorize(fn) {
    let cache = null
    return (...args) => {
        if (cache === null) {
            return cache = fn(...args)
        }
        return cache
    }
}

async function connect() {
    const client = new Client()
    await client.connect()
    return client
}

module.exports = memorize(connect)
