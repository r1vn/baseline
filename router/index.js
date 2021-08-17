'use strict'

const fs = require('fs')
const _404 = require('./special/404')
const _500 = require('./special/500')

const endpoints = {}

for (const id of fs.readdirSync(`${ __dirname }/endpoints`))
{
    endpoints[id] = require(`${ __dirname }/endpoints/${ id }`)
}

let reqc = 0

const router = async (req, res) =>
{
    const req_id = `${ process.env.PORT }-${ ++reqc } ${ req.method } ${ req.url }`

    if (!process.env.PROD)
    {
        var d = new Date()
        console.log(`${ d.toISOString() } REQ ${ req_id }`)
    }
    
    let endpointID
    for (const id in endpoints)
    {
        if (endpoints[id].matcher(req))
        {
            endpointID = id
            break
        }
    }

    if (!process.env.PROD)
    {
        res.on('close', () => console.log(`${ new Date().toISOString() } RES ${ req_id } -> ${ res.statusCode } ${ Date.now() - d.getTime() }ms ${ endpointID ? `endpoints/${ endpointID }` : 'special/404.js' }`))
    }

    try
    {
        await (endpoints[endpointID]?.handler || _404)(req, res)
    }
    catch (err)
    {
        console.error({
            time: new Date().toISOString(),
            server: process.env.PORT,
            headers: req.headers,
            method: req.method,
            url: req.url,
            endpoint: endpointID ? `endpoints/${ endpointID }` : 'special/404.js',
            error: err
        })

        _500(req, res, err)
    }
}

module.exports = router