import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {Message, Producer, QueueManager} from "redis-smq";
import {
  Activity,
  McpReq,
  MnaReq,
  MndReq,
  MnqReq,
  MnsReq,
  NarReq,
  Notify,
  NsrReq,
  OcaReq,
  ScriptResult,
  TrqReq
} from "../models";
import {MroReq} from "../models/mro-req.model";
import {PAGES} from "../constants/pages";
import {NSR_SUBMIT_TYPE} from "../constants/number_adminstration";
import {RSMQ_CONFIG, RSMQ_QUEUE} from "../config";
import DataUtils from "../utils/data";

@injectable({scope: BindingScope.TRANSIENT})
export class MessageQueueService {

  TTL = 3600000

  constructor() {
  }

  private notify(data: any) {
    const producer = new Producer(RSMQ_CONFIG)
    // activity.req = req

    producer.run((err) => {
      if (err)
        console.error("Producing Error: ", err)
      else {
        const message = new Message()
        message.setBody({
          ...data,
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

  private push(activity: Activity, req: any) {
    this.notify({
      ...activity, req
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

  pushMCP(activity: Activity, req: McpReq) {
    this.push(activity, req)
  }

  pushNAR(req: NarReq) {
    const activtity = new Activity()

    activtity.id = req.id
    activtity.user_id = req.user_id
    activtity.page = PAGES.AutoReserveNumbers
    activtity.operation = NSR_SUBMIT_TYPE.SEARCH_RESERVE
    activtity.total = req.total
    activtity.failed = req.failed
    activtity.completed = req.completed
    activtity.message = req.message
    activtity.status = req.status
    activtity.sub_dt_tm = req.sub_dt_tm
    activtity.created_at = req.updated_at
    activtity.updated_at = req.updated_at
    activtity.req_id = req.id

    this.push(activtity, req)
  }

  pushOCA(activity: Activity, req: OcaReq) {
    this.push(activity, req)
  }

  pushMNA(activity: Activity, req: MnaReq) {
    this.push(activity, req)
  }

  pushScriptExecution(result: ScriptResult) {
    this.notify({...result, page: PAGES.SQLScriptExecutionResult})
  }

  pushTAD(msg: Notify) {
    this.notify(msg)
  }

  pushCAD(msg: Notify) {
    this.notify(msg)
  }

  pushPAD(msg: Notify) {
    this.notify(msg)
  }
}
