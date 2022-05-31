const { getRowsToUpdate } = require('../helpers/database.js')

const getPosts = async (db) => {
    const r = await db.query('SELECT * FROM posts')
    return r.rows
}

const getPost = async (db, postId) => {
    const r = await db.query('SELECT * FROM posts WHERE id = $1', [postId])

    return r.rows[0]
}

const addPost = async (db, post) => {
    const r = await db.query('INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING *', [post.title, post.content, post.author_id])

    return r.rows[0]
}

const deletePost = async (db, postId) => {
    const r = await db.query('DELETE FROM posts WHERE id = $1 RETURNING *', [postId])

    return r.rows[0]
}

const updatePost = async (db, postId, postData) => {
    const rowsToUpdate = getRowsToUpdate(postData)

    const r = await db.query(
        `UPDATE posts SET ${rowsToUpdate.join(', ')} WHERE id = $${rowsToUpdate.length + 1} RETURNING *`,
        Object.values(postData).concat(postId)
    )

    return r.rows[0]
}


module.exports = {
    getPost,
    getPosts,
    addPost,
    deletePost,
    updatePost,
}
