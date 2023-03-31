import {ApplicationConfig, BackendApplication} from './application';
import {QueueManager} from "redis-smq";
import {EQueueType} from "redis-smq/dist/types";
import {HttpErrors} from "@loopback/rest";
import {startEventStreamServer} from "./event_stream";
import {PRIVATE_KEY, PUBLIC_KEY, RSMQ_CONFIG, RSMQ_QUEUE, SERVER} from "./config";

export * from './application';

export function createQueue(queue: string, callback: any) {
  console.log("Creating Queue:" + queue + " .......")
  QueueManager.createInstance(RSMQ_CONFIG, (err, queueManager) => {
    if (err)
      throw err

    queueManager?.queue?.exists(queue, (err, isExist) => {
      if (!isExist) {
        queueManager?.queue.save(queue, EQueueType.LIFO_QUEUE, (err) => {
          if (err!=null)
            throw err

          callback()
        })
      }
      else {
        console.log("Queue:" + queue + " is already existed...")
        callback()
      }
    })
  })
}

export async function main(options: ApplicationConfig = {}) {
  createQueue(RSMQ_QUEUE, () => {
    startEventStreamServer(process.env.NODE_ENV, options.rest)
  })

  const app = new BackendApplication(options);
  await app.basePath("/api/v1");
  await app.restServer.basePath("/api/v1");
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);
  console.log("Environment", process.env.NODE_ENV)

  return app;
}

if (require.main === module) {
  // Run the application
  const config: any = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.NODE_ENV=='production' ? SERVER : process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 86400,
      credentials: true,
    },
  };

  if (process.env.NODE_ENV=='production') {
    const fs = require("fs");
    config.rest.protocol = 'https';
    config.rest.key = fs.readFileSync(PRIVATE_KEY).toString();
    config.rest.cert = fs.readFileSync(PUBLIC_KEY).toString();

    // console.log(config.rest.key, config.rest.cert)
  }

  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
