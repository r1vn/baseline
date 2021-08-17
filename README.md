baseline template for a generic node server app

## setup - development

[download](https://github.com/r1vn/baseline/archive/refs/heads/master.zip), unpack, run `node .`

## setup - production

see [DEPLOYMENT.md](https://github.com/r1vn/baseline/blob/master/DEPLOYMENT.md) for a step-by-step example of deployment process on a linux server with nginx as reverse proxy

## overview

### clustering

the app will run as many server instances as there are ports specified in the `server/config.js`

    exports.ports = ['8080', '8081', '8082', '8083']

### IPC

servers can communicate with the master or each other via `process.send(message)`, where the message is any JSON-serializable value.
messages received by the master and server processes are handled by example functions located in `server/relay.js`.

### error handling

unhandled exceptions and rejections crash the server instance. it will then be restarted by the master if `restart = true` in the config, otherwise
the whole cluster will terminate.

### logging

use `console.log`/`console.error` and capture stdout/stderr by systemd or something else in production. 

### routing

the router is a separate module imported by the server from the `router/index.js`. it is the function set as the listener for the `request` event of [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server)

example `router/index.js` replacement with express:

    const express = require('express')
    const app = express()
    ...
    module.exports = app

the default router (described below is provided for demonstration purposes, although it can do adequate job out of the box

<hr>

endpoint modules are located in `router/endpoints` and are loaded automatically by the router. a module may be a single `.js` file or a directory with an `index.js` file.  
each module has to export a pair of matcher and handler functions. the matcher receives the [request](https://nodejs.org/api/http.html#http_class_http_incomingmessage) object
and must return a truthy value if the request matches the endpoint, then the handler function that receives request and [response](https://nodejs.org/api/http.html#http_class_http_serverresponse)
object is executed. the handler may be an async function.

`endpoints/index.js`

    exports.matcher = req =>
    {
        return ['/', '/index.html'].includes(req.url)
    }
    
    exports.handler = (req, res) =>
    {
        res.writeHead(200, { 'content-type': 'text/plain' })
        res.end('hello world')
    }

if no endpoint has been matched for the request, the router runs the handler located in `router/special/404.js`

all modules in `router/endpoints` are provided for demonstration purposes.  
modules in `router/special` are required, but may be modified.

errors in endpoint handlers are handled by `router/endpoints/500.js`.  
requests and responses are logged in development but not in production (with `PROD` environment variable set), where they are assumed to be logged upstream by the proxy. 