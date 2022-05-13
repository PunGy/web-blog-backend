const http = require('http');

const readBody = (req) => new Promise((resolve, reject) => {
    const body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    });
    req.on('error', (err) => {
        reject(err);
    })
    req.on('end', () => {
        resolve(Buffer.concat(body));
    });
})

const response404 = JSON.stringify({ status: 404, message: 'Not Found' })

const posts = []

const server = http.createServer(async (req, res) => {
    const { method, url } = req

    res.setHeader('Content-Type', 'application/json');

    if (method === 'GET') {
        if (url === '/posts') {
            res.statusCode = 200
            res.write(JSON.stringify(posts));
        } else if (url.startsWith('/post/')) {
            const id = parseInt(url.split('/').pop(), 10)
            const post = posts.find(p => p.id === id)
            if (post) {
                res.statusCode = 200
                res.write(JSON.stringify(post));
            } else {
                res.statusCode = 404
                res.write(JSON.stringify({ status: 404, message: `No such post with id: ${id}` }));
            }
        } else {
            res.statusCode = 404
            res.write(response404);
        }
    } else if (method === 'POST') {
        if (url === '/post') {
            const body = await readBody(req)
            
            const post = JSON.parse(body.toString())
            const postId = posts.push(post) - 1
            post.id = postId

            res.statusCode = 200;
            res.write(JSON.stringify(post))
        }
    } else {
        res.statusCode = 404
        res.write(response404)
    }

    res.end();
})

server.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
})