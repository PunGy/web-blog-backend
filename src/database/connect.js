const database = {
    users: [],
    posts: [],
    sessions: [],
}
async function connect() {
    return database
}

module.exports = connect
