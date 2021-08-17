'use strict'

exports.matcher = req =>
{
    return req.url === '/relay'
}

exports.handler = (req, res) =>
{
    process.send('ping')
    res.end('ping')
}