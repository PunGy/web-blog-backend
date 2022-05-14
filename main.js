const http = require('http');
const RestLib = require('rest-library');
const { parseBodyMiddleware } = require('rest-library/utils.js')
const { parseQuery } = require('rest-library/helpers.js')

const app = new RestLib()

const posts = []
const users = [
    { id: 1, name: 'John', password: '123' },
]

const authorizedOnly = (ctx, next) => {
    if (ctx.user) {
        next()
    } else {
        ctx.response.send({
            error: 'Unauthorized',
        }, 401)
    }
}

app.use(parseBodyMiddleware)
app.use((ctx, next) => {
    if (ctx.request.query != null) {
        const queryParams = parseQuery(ctx.request.query)
        const user = users.find(user => {
            if (user.name === queryParams.name && user.password === queryParams.password) {
                return true
            }
        })

        ctx.user = user
    }

    next()
})

app.get('/posts', (ctx, next) => {
    ctx.response.send(posts)

    next()
})

app.get('/post/:id', () => {

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
