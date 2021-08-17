'use strict'

module.exports = (req, res) =>
{
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('not found')
}