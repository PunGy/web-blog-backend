const cookie = require('cookie')
const { v4: generateSID } = require('uuid')

const sessions = new Map()
const sessionIdCookieName = 'SID'

function sessionMiddleware(ctx, next) {
    if (ctx.session != null) {
        next()
        return
    }

    const sessionId = ctx.request.cookie[sessionIdCookieName]
    if (sessionId == null) {
        const session = { id: generateSID() }
        sessions.set(session.id, session)
        ctx.session = session

        const cookieAge = new Date()
        cookieAge.setFullYear(cookieAge.getFullYear() + 1)
        ctx.response.setHeader('Set-Cookie', cookie.serialize(sessionIdCookieName, session.id, {
            httpOnly: true,
            expires: cookieAge,
        }))
    } else {
        const session = sessions.get(sessionId)
        if (session) {
            ctx.session = session
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

module.exports = sessionMiddleware