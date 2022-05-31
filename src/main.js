require('dotenv').config()

const RestLib = require('rest-library');
const { parseBodyMiddleware } = require('rest-library/utils.js')

const parseCookieMiddleware = require('./middleware/parseCookie.js')
const onlyAuthenticatedMiddleware = require('./middleware/onlyAuthenticated.js')
const authenticateMiddleware = require('./middleware/authenticate.js')
const sessionMiddleware = require('./middleware/session.js')

const connect = require('./database/connect.js')
const { addUser, getUserByCredentials } = require('./database/users.js')
const { addPost, deletePost, getPost, getPosts, updatePost } = require('./database/posts.js')

const app = new RestLib()

app.error((ctx, error) => {
    console.error(error)

    ctx.response.send({
        error: error.message,
    }, 500)
})

app.use(parseBodyMiddleware)
app.use((ctx, next) => {
    console.log(`${ctx.request.method}: ${ctx.request.url}`)
    if (ctx.request.body != null) {
        console.log(ctx.request.body, '\n')
    } else {
        console.log()
    }

    next()
})
app.use(parseCookieMiddleware)
app.use(sessionMiddleware)
app.use(authenticateMiddleware)

/**
 * ----------- AUTHENTICATION -----------
 */

function userBodyValidation (ctx, next) {
    const { body } = ctx.request

    if (body.username == null || body.password == null) {
        ctx.response.send({
            error: 'Invalid body',
        }, 400)
        return
    }

    ctx.userBody = body
    next()
}
app.post('/registration', userBodyValidation, async (ctx) => {
    const db = await connect()

    const user = await addUser(db, ctx.userBody)
    ctx.session.userId = user.id

    ctx.response.send(user)
})

app.post('/login', userBodyValidation, async (ctx) => {
    const db = await connect()
    const user = await getUserByCredentials(db, ctx.userBody.username, ctx.userBody.password)

    if (user) {
        ctx.session.userId = user.id
        ctx.response.send(user)
    } else {
        ctx.response.send({
            error: 'Invalid user data',
        }, 401)
    }
})

app.post('/logout', (ctx) => {
    delete ctx.session.userId
    ctx.response.send({
        message: 'Logout successful',
    })
})

app.get('/user', onlyAuthenticatedMiddleware, (ctx) => {
    ctx.response.send(ctx.user)
})

/**
 * ----------- END AUTHENTICATION -----------
 */

/**
 * ----------- POSTS -----------
 */

const postBodyValidation = (ctx, next) => {
    const { body } = ctx.request

    if (body.title == null || body.content == null) {
        ctx.response.send({
            error: 'Invalid body',
        }, 400)
        return
    }

    ctx.postBody = body
    next()
}

app.get('/posts', async (ctx) => {
    const db = await connect()
    const posts = await getPosts(db)
    ctx.response.send(posts)
})

app.get('/post/:id', async (ctx) => {
    const db = await connect()
    const postId = parseInt(ctx.request.params.id, 10)
    const post = await getPost(db, postId)

    if (post) {
        ctx.response.send(post)
    } else {
        ctx.response.send({
            error: 'Post not found'
        }, 404)
    }
})

app.post('/post', onlyAuthenticatedMiddleware, postBodyValidation, async (ctx) => {
    const post = {
        title: ctx.postBody.title,
        content: ctx.postBody.content,
        author_id: ctx.user.id,
    }
    const db = await connect()

    await addPost(db, post)

    ctx.response.send(post)
})

app.delete('/post/:id', onlyAuthenticatedMiddleware, async (ctx) => {
    const db = await connect()
    const postId = parseInt(ctx.request.params.id, 10)
    const post = await deletePost(db, postId)

    if (post) {
        ctx.response.send({
            message: 'Post deleted',
        })
    } else {
        ctx.response.send({
            error: 'Post not found'
        }, 404)
    }
})

app.put('/post/:id', onlyAuthenticatedMiddleware, postBodyValidation, async (ctx) => {
    const db = await connect()
    const postId = parseInt(ctx.request.params.id, 10)
    const { postBody } = ctx

    const postToUpdate = await getPost(db, postId)
    if (!postToUpdate) {
        ctx.response.send({
            error: 'Post not found',
        }, 404)
        return
    }

    if (ctx.user.id !== postToUpdate.author_id && ctx.user.id !== 1) {
        ctx.response.send({
            error: 'You are not the author of this post',
        }, 401)
        return
    }

    const updatedPost = await updatePost(db, postId, postBody)

    if (updatedPost) {
        ctx.response.send(postBody)
    } else {
        ctx.response.send({
            error: 'Post not found'
        }, 404)
    }
})

/**
 * ----------- END POSTS -----------
 */

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
})

const shutdownApplication = (signal) => async () =>
{
    const db = await connect()
    await db.end()
    console.log(`Application is turned off. SIGNAL: ${signal}`)
}
process.once('SIGINT', shutdownApplication('SIGINT'))
process.once('SIGTERM', shutdownApplication('SIGTERM'))
