const RestLib = require('rest-library');
const { parseBodyMiddleware } = require('rest-library/utils.js')
const cookie = require('cookie')
const { v4: generateSID } = require('uuid')

const app = new RestLib()

const posts = []
const users = []

const sessions = new Map()
const sessionIdCookieName = 'SID'

const authorizedOnly = (ctx, next) => {
    if (ctx.request.session.user) {
        next()
    } else {
        ctx.response.send({
            error: 'Unauthorized',
        }, 401)
    }
}

const parseCookieMiddleware = (ctx, next) => {
    const rawCookie = ctx.request.headers.cookie
    ctx.request.cookie = {}
    if (rawCookie) {
        Object.assign(ctx.request.cookie, cookie.parse(rawCookie))
    }
    next()
}

const sessionMiddleware = (ctx, next) => {
    if (ctx.request.session != null) {
        next()
        return
    }

    const sessionId = ctx.request.cookie[sessionIdCookieName]
    if (sessionId == null) {
        const session = { id: generateSID() }
        sessions.set(session.id, session)
        ctx.request.session = session

        const cookieAge = new Date()
        cookieAge.setFullYear(cookieAge.getFullYear() + 1)
        ctx.response.setHeader('Set-Cookie', cookie.serialize(sessionIdCookieName, session.id, {
            httpOnly: true,
            expires: cookieAge,
        }))
    } else {
        const session = sessions.get(sessionId)
        if (session) {
            ctx.request.session = session
        } else {
            ctx.response.setHeader('Set-Cookie', cookie.serialize(sessionIdCookieName, sessionId, {
                httpOnly: true,
                expires: new Date(0),
            }))
            ctx.response.send({
                error: 'Invalid session',
            }, 401)
            return
        }
    }

    next()
}

app.use(parseBodyMiddleware)
app.use(parseCookieMiddleware)
app.use(sessionMiddleware)
app.use((ctx, next) => {
    if (ctx.request.query != null) {
        const { queryParams } = ctx.request
        const user = users.find(user => {
            if (user.name === queryParams.name && user.password === queryParams.password) {
                return true
            }
        })

        ctx.user = user
    }

    next()
})


app.post('/registration', (ctx, next) => {
    const { body } = ctx.request

    if (body.login == null || body.password == null) {
        ctx.response.send({
            error: 'Invalid body',
        }, 400)
        next()
        return
    }

    const user = {
        id: generateSID(),
        login: body.login,
        password: body.password,
    }
    users.push(user)
    ctx.request.session.user = user
    
    ctx.response.send(user)
    next()
})

app.post('/login', (ctx, next) => {
    const { body } = ctx.request

    if (body.login == null || body.password == null) {
        ctx.response.send({
            error: 'Invalid body',
        }, 400)
        next()
        return
    }

    const user = users.find(user => {
        if (user.login === body.login && user.password === body.password) {
            return true
        }
    })

    if (user) {
        ctx.request.session.user = user
        ctx.response.send(user)
    } else {
        ctx.response.send({
            error: 'Invalid user data',
        }, 401)
    }

    next()
})


app.get('/posts', (ctx, next) => {
    ctx.response.send(posts)

    next()
})

app.get('/post/:id', (ctx, next) => {
    const id = parseInt(ctx.request.params.id, 10)
    const post = posts.find(p => p.id === id)
    if (post) {
        ctx.response.send(post)
    } else {
        ctx.response.send({
            error: 'Post not found'
        }, 404)
    }

    next()
})

app.post('/post', authorizedOnly, (ctx, next) => {
    const post = ctx.request.body
    post.id = posts.length === 0 ? 0 : posts[posts.length - 1].id + 1
    posts.push(post)

    ctx.response.send(post)

    next()
})

app.delete('/post/:id', authorizedOnly, (ctx, next) => {
    const id = parseInt(ctx.request.params.id, 10)
    const index = posts.findIndex(p => p.id === id)
    
    if (index !== -1) {
        posts.splice(index, 1)
        ctx.response.send({
            message: 'Post deleted',
        })
    } else {
        ctx.response.send({
            error: 'Post not found'
        }, 404)
    }

    next()
})

app.put('/post/:id', authorizedOnly, (ctx, next) => {
    const id = parseInt(ctx.request.params.id, 10)
    const index = posts.findIndex(p => p.id === id)
    const post = ctx.request.body

    if (index !== -1) {
        post.id = id
        posts[index] = post
        ctx.response.send(post)
    } else {
        ctx.response.send({
            error: 'Post not found'
        }, 404)
    }

    next()
})

app.use((ctx) => {
    console.log(`${ctx.request.method}: ${ctx.request.url}`)
    if (ctx.request.body != null) {
        console.log(ctx.request.body, '\n')
    } else {
        console.log()
    }
})

app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
})
