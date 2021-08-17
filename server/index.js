'use strict'

if (!process.env.PORT)
{
    const cp = require('child_process')
    const config = require('./config')
    const relay = require('./relay')
    const servers = {}

    function start (port)
    {
        servers[port] = cp.fork(__filename, { env: { ...process.env, PORT: port } })

        servers[port].on('exit', () =>
        {
            if (config.restart)
            {
                console.log(`server ${ port } has crashed. restarting`)
                start(port)
            }
            else
            {
                console.log(`server ${ port } has crashed. terminating`)
                process.exit(1)
            }
        })

        servers[port].on('message', msg => relay(msg, port, servers))
    }

    for (let i = 0; i < config.ports.length; i++)
    {
        start(config.ports[i])
    }
}
else
{
    const http = require('http')
    const router = require('../router')
    const relay = require('./relay')

    const globalErrorHandler = (err) =>
    {
        console.error({
            time: new Date().toISOString(),
            server: process.env.PORT,
            error: err
        })

        process.exit(1)
    }

    process.on('uncaughtException', globalErrorHandler)
    process.on('unhandledRejection', globalErrorHandler)
    process.on('message', relay)

    http.createServer(router).listen({ port: process.env.PORT }, () => console.log(`server is up: http://localhost:${ process.env.PORT }`))
}

