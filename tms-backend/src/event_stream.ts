import {Consumer} from "redis-smq";
import {ConsumerError} from "redis-smq/dist/src/lib/consumer/errors/consumer.error";
import {RSMQ_CONFIG, RSMQ_QUEUE} from "./config";

export const startEventStreamServer = (env: any, options: any) => {
    console.log("Starting EventStream Server .......")

    const express = require('express');
    const app = express();
    const cors = require('cors');

    app.use(cors());

    const SSE_RESPONSE_HEADER = {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    };

    const events = require('events')
    const em = new events.EventEmitter()
    em.setMaxListeners(env=='production' ? 100 : 30)

    const consumer = new Consumer(RSMQ_CONFIG)
    // let users: any[] = [];
    let sessionIds: any[] = []

    consumer.consume(RSMQ_QUEUE, (message, cb) => {
        // console.log("RSMQ Consuming....", message.getBody())
        // @ts-ignore
        // if (users.includes(message.getBody().user_id)) {
        //     console.log("emit", message.getBody)
            sessionIds.forEach(item => {
                // @ts-ignore
                em.emit('consumer-'+ message.getBody().user_id+"-"+item, message.getBody())
            })
            cb()
        // } else {
        //     cb(new ConsumerError("no users"))
        // }
    }, (err) => {
        if (err!=null) {
            // console.log("RSMQ Consumer Error", typeof err)
        }
    })

    app.get("/", (req: any, res: any) => {
        const headers = {
            'Content-Type': 'text/html',
        };

        res.writeHead(200, headers)
        res.write("EventStream Server")
    })

    app.get("/stream/:userId/:sessionId", (req: any, res: any) => {
        let userId = Number(req.params.userId)
        let sessionId = req.params.sessionId
        // console.log("start....", userId, sessionId)
        // if (!users.includes(userId))
        //     users.push(userId)
        // console.log(users)
        // console.log("Stream", userId)
        if (!sessionIds.includes(sessionId))
            sessionIds.push(sessionId)

        res.writeHead(200, SSE_RESPONSE_HEADER);
        res.write(`:\n\n`);

        let handler = (data: any) => {
            // console.log("handler", data)
            if (data.user_id == userId) {
                res.write(`data: ${JSON.stringify(data)}\n\n`)
                res.write(`:\n\n`);
            }
        }
        em.on('consumer-'+userId+"-"+sessionId, handler)

        req.on('close', () => {
            const index = sessionIds.findIndex(item => item==sessionId)
            if (index>-1)
                sessionIds.splice(index, 1)
            // console.log("EventStream Server: disconnected user....", userId, sessionId)
            em.removeListener('consumer-'+userId+"-"+sessionId, handler)
        })

        req.on('end', () => {
            console.log("EventStream Server is ended....")
            // users = []
            // sessionIds = []
            em.removeAllListeners('consumer-'+userId+"-"+sessionId)
        })
    })

    if (env=='production') {
        const https = require("https");

        const https_options = {
            host: options.host,
            key: options.key,
            cert: options.cert,
        }

        https.createServer(https_options, app).listen(6379, function() {
            console.log("EventStream Server is listening on port 6379.....")
        })

    } else {
        app.listen(6379, function() {
            console.log("EventStream Server is listening on port 6379.....")
        })
    }

    consumer.run()

}