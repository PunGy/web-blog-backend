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

    if (body.login == null || body.password == null) {
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

    const user = ctx.userBody
    await addUser(db, user)

    ctx.session.userId = user.id

    ctx.response.send(user)
})

app.post('/login', userBodyValidation, async (ctx) => {
    const db = await connect()
    const user = await getUserByCredentials(db, ctx.userBody.login, ctx.userBody.password)

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
    const post = ctx.postBody
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
