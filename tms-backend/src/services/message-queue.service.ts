import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {Message, Producer, QueueManager} from "redis-smq";
import {RSMQ_CONFIG, RSMQ_QUEUE} from "../index";
import {Activity, MndReq, MnqReq, MnsReq, NsrReq, TrqReq} from "../models";
import {MroReq} from "../models/mro-req.model";

@injectable({scope: BindingScope.TRANSIENT})
export class MessageQueueService {

  TTL = 3600000

  constructor() {
  }

  private push(activity: Activity, req: any) {
    const producer = new Producer(RSMQ_CONFIG)
    // activity.req = req

    producer.run((err) => {
      if (err)
        console.error("Producing Error: ", err)
      else {
        const message = new Message()
        message.setBody({
          ...activity,
          req: req
        }).setTTL(this.TTL).setQueue(RSMQ_QUEUE)

        producer.produce(message, (err) => {
          if (err)
            console.error(err)
          // else
          //   console.log("Produced. Message ID: " + message.getId())
        })
      }
    })
  }

  pushNSR(activity: Activity, req: NsrReq) {
    this.push(activity, req)
  }

  pushNQU(activity: Activity, req: any) {
    this.push(activity, req)
  }

  pushTRQ(activity: Activity, req: TrqReq) {
    this.push(activity, req)
  }

  pushMNQ(activity: Activity, req: MnqReq) {
    this.push(activity, req)
  }

  pushMND(activity: Activity, req: MndReq) {
    this.push(activity, req)
  }

  pushMNS(activity: Activity, req: MnsReq) {
    this.push(activity, req)
  }

  pushMRO(activity: Activity, req: MroReq) {
    this.push(activity, req)
  }

}
