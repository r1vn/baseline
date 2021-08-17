'use strict'

exports.matcher = req =>
{
    return ['/', '/index.html'].includes(req.url)
}

exports.handler = (req, res) =>
{
    res.writeHead(200, { 'content-type': 'text/html' })
    res.end(`<pre>\
hello world

<a href="/relay">/relay</a>
<a href="/error">/error</a>
<a href="/crash">/crash</a>
</pre>`)
}