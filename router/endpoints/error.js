'use strict'

exports.matcher = req =>
{
    return req.url === '/error'
}

exports.handler = (req, res) =>
{
    aaa
}