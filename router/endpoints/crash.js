'use strict'

exports.matcher = req =>
{
    return req.url === '/crash'
}

exports.handler = (req, res) =>
{
    res.end('AAA')
    setTimeout(() => AAA, 2000)
}