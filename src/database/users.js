const getUser = async (db, userId) => {
    const r = await db.query('SELECT username, id FROM users WHERE id = $1', [userId])
    return r.rows[0]
}

const getUsers = async (db) => {
    const r = await db.query('SELECT id, username FROM users')
    return r.rows
}

const addUser = async (db, user) => {
    const r = await db.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username', [user.username, user.password])
    const insertedUser = r.rows[0]

    return insertedUser
}

const deleteUser = async (db, userId) => {
    const r = await db.query('DELETE FROM users WHERE id = $1', [userId])

    return r.rowCount === 1
}

const updateUser = async (db, userId, userData) => {
    const rowsToUpdate = Object.keys(userData).map((key, index) => `${key} = $${index + 1}`)

    const r = await db.query(
        `UPDATE users SET ${rowsToUpdate.join(', ')} WHERE id = $${rowsToUpdate.length + 1} RETURNING id, username`,
        Object.values(userData).concat(userId),
    )

    return r.rows[0]
}

const getUserByCredentials = async (db, login, password) => {
    const user = (await db.query('SELECT id, username FROM users WHERE username = $1 AND password = $2', [login, password])).rows[0]

    return user
}

module.exports = {
    getUser,
    getUsers,
    addUser,
    deleteUser,
    updateUser,
    getUserByCredentials,
}
