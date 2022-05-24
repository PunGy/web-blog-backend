const { v4: generateID } = require('uuid')

const getUser = async (db, userId) => {
    if (db.users == null) return null
    return db.users.find(user => user.id === userId)
}

const getUsers = async (db) => {
    return db.users
}

const addUser = async (db, user) => {
    if (db.users == null) return null
    user.id = generateID()
    db.users.push(user)
    return user
}

const deleteUser = async (db, userId) => {
    if (db.users === null) return null
    const index = db.users.findIndex((user) => user.id === userId)

    if (index === -1) return null
    return db.users.splice(index, 1)[0]
}


const updateUser = async (db, userId, userData) => {
    if (db.users == null) return null
    const index = db.users.findIndex((user) => user.id === userId)
    if (index === -1) return null
    Object.assign(db.users[index], userData)
    return user
}

const getUserByCredentials = async (db, login, password) => {
    if (db.users == null) return null
    return db.users.find(user => user.login === login && user.password === password)
}

module.exports = {
    getUser,
    getUsers,
    addUser,
    deleteUser,
    updateUser,
    getUserByCredentials,
}
