'use strict'

const config = require('./config')

if (!process.env.PORT)
{
    module.exports = function relay (msg, sender, servers)
    {
        if (msg === 'ping')
        {
            console.log('master: pong')

            for (const port of config.ports)
            {
                if (port !== sender)
                {
                    servers[port].send(msg)
                }
            }
        }
    }
}
else
{
    module.exports = function relay (msg)
    {
        if (msg === 'ping')
        {
            console.log(`server ${ process.env.PORT }: pong`)
        }
    }
}