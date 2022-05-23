const getPosts = async (db) => {
    return db.posts
}

const getPost = async (db, postId) => {
    return db.posts && db.posts.find(post => post.id === postId)
}

const addPost = async (db, post) => {
    if (db.posts) {
        post.id = db.posts.length === 0 ? 0 : db.posts[db.posts.length - 1].id + 1
        db.posts.push(post)
    }
    return post
}

const deletePost = async (db, postId) => {
    if (db.posts) {
        const index = db.posts.findIndex((post) => post.id === postId)

        if (index === -1) return null

        return db.posts.splice(index, 1)[0]
    }
    return null
}

const updatePost = async (db, postId, postData) => {
    if (db.posts) {
        const index = db.posts.findIndex((post) => post.id === postId)

        if (index === -1) return null

        Object.assign(db.posts[index], postData)
    }
    return postData
}

module.exports = {
    getPost,
    getPosts,
    addPost,
    deletePost,
    updatePost,
}
