import {createQueue, PRIVATE_KEY, PUBLIC_KEY, RSMQ_CONFIG, RSMQ_QUEUE, SERVER} from "./index";
import {Consumer} from "redis-smq";
import {ConsumerError} from "redis-smq/dist/src/lib/consumer/errors/consumer.error";

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

    const consumer = new Consumer(RSMQ_CONFIG)
    let users: any[] = [];

    consumer.consume(RSMQ_QUEUE, (message, cb) => {
        // console.log("RSMQ Consuming....", message.getBody())
            // @ts-ignore
        if (users.includes(message.getBody().user_id)) {
            em.emit('consumer', message.getBody())
            cb()
        } else {
            cb(new ConsumerError("no users"))
        }
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

    app.get("/stream/:userId", (req: any, res: any) => {
        let userId = Number(req.params.userId)
        if (!users.includes(userId))
            users.push(userId)
        // console.log(users)

        res.writeHead(200, SSE_RESPONSE_HEADER);
        res.write(`:\n\n`);

        em.on('consumer', (data: any) => {
            if (data.user_id == userId) {
                res.write(`data: ${JSON.stringify(data)}\n\n`)
                res.write(`:\n\n`);
            }
        })

        req.on('close', () => {
            const index = users.findIndex(item => item==userId)
            if (index>-1)
                users.splice(index, 1)
            // console.log("EventStream Server: disconnected user....")
        })

        req.on('end', () => {
            users = []
            // console.log("EventStream Server is ended....")
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