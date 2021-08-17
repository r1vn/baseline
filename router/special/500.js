'use strict'

module.exports = (req, res, err) =>
{
    if (!res.writableEnded)
    {
        if (!res.headersSent)
        {
            res.writeHead(500, { 'content-type': 'text/plain' })
        }
        
        res.end(`internal server error: ${ err.message }`)
    }
}