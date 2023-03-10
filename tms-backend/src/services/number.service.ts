import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {
  Activity,
  AuthorizedUserProfile,
  NsrReq,
  NsrResult,
  Numbers,
  ActivityResult,
  TrqReq,
  TrqResult, MnqResult, MnqReq, MndReq, MndResult, MnsReq, MnsResult, MCPRequest
} from "../models";
import {TfnRegistryApiService} from "./tfn-registry-api.service";
import {repository} from "@loopback/repository";
import {
  ActivityRepository,
  NsrReqRepository,
  NsrResultRepository,
  NumbersRepository,
  ActivityResultRepository,
  TrqReqRepository,
  TrqResultRepository,
  MnqReqRepository,
  MnqResultRepository,
  MndResultRepository,
  MndReqRepository,
  MnsReqRepository, MnsResultRepository, MroReqRepository, MroResultRepository
} from "../repositories";
import {HttpErrors} from "@loopback/rest";
import DataUtils from "../utils/data";
import {NSRRequest} from "../models/nsr.request";
import {MESSAGES} from "../constants/messages";
import {
  NSR_SUBMIT_TYPE,
  NSR_TYPE,
  NUMBER_STATUS, PAGE_OPERATION,
  PROGRESSING_STATUS, TASK_ACTION, TASK_TYPE
} from "../constants/number_adminstration";
import {Producer} from "redis-smq";
import {MessageQueueService} from "./message-queue.service";
import {PAGES} from "../constants/pages";
import {NQURequest} from "../models/nqu.request";
import {REQ_SIZE} from "../constants/configurations";
import {TRQRequest} from "../models/trq.request";
import {MNQRequest} from "../models/mnq.request";
import {MNDRequest} from "../models/mnd.request";
import {MNSRequest} from "../models/mns.request";
import {MRORequest} from "../models/mro.request";
import {MroReq} from "../models/mro-req.model";
import {MroResult} from "../models/mro-result.model";

@injectable({scope: BindingScope.TRANSIENT})
export class NumberService {
  constructor(
      @service(TfnRegistryApiService)
      public tfnRegistryApiService: TfnRegistryApiService,
      @service(MessageQueueService)
      public messageQueueService: MessageQueueService,
      @repository(NsrReqRepository)
      public nsrReqRepository: NsrReqRepository,
      @repository(NsrResultRepository)
      public nsrResultRepository: NsrResultRepository,
      @repository(TrqReqRepository)
      public trqReqRepository: TrqReqRepository,
      @repository(TrqResultRepository)
      public trqResultRepository: TrqResultRepository,
      @repository(MnqReqRepository)
      public mnqReqRepository: MnqReqRepository,
      @repository(MnqResultRepository)
      public mnqResultRepository: MnqResultRepository,
      @repository(MndReqRepository)
      public mndReqRepository: MndReqRepository,
      @repository(MndResultRepository)
      public mndResultRepository: MndResultRepository,
      @repository(MnsReqRepository)
      public mnsReqRepository: MnsReqRepository,
      @repository(MnsResultRepository)
      public mnsResultRepository: MnsResultRepository,
      @repository(MroReqRepository)
      public mroReqRepository: MroReqRepository,
      @repository(MroResultRepository)
      public mroResultRepository: MroResultRepository,
      @repository(NumbersRepository)
      public numbersRepository: NumbersRepository,
      @repository(ActivityRepository)
      public activityRepository: ActivityRepository,
      @repository(ActivityResultRepository)
      public activityResultRepository: ActivityResultRepository,
  ) {}

  private appendErrorMessage(error_message: string, new_msg: string): string {
    const errors: string[] = error_message.split("\n\n");
    if (errors.includes(new_msg))
      return error_message

    if (error_message!="")
      error_message += "\n\n"
    error_message += new_msg

    return error_message
  }

  private async saveNumber(profile: AuthorizedUserProfile, num: string, status: string, sub_dt_tm: string, resp_org?: string) {
    let created_by = profile.user.id
    let created_at = new Date().toISOString()

    let numObj: any = await this.numbersRepository.findOne({where: {num: num}})
    if (numObj) {
      created_by = numObj.created_by
      created_at = numObj.created_at
      await this.numbersRepository.deleteById(numObj.id)
    }

    numObj = new Numbers()
    numObj.num = num

    if (resp_org!=null) {
      numObj.entity = resp_org.substring(0, 2)
      numObj.resp_org = resp_org
    }

    numObj.sub_dt_tm = sub_dt_tm
    numObj.status = status

    numObj.created_at = created_at
    numObj.created_by = created_by
    numObj.updated_at = new Date().toISOString()
    numObj.updated_by = profile.user.id!

    await this.numbersRepository.create(numObj)
  }

  private async saveActivityResult(profile: AuthorizedUserProfile, activity_id: string, type: string, action: string, tgt_num: string, sub_dt_tm: string, status: string, resp_org?: string, message?: string, tgt_eff_dt_tm?: string, tgt_tmpl_name?: string, is_now?: boolean) {
    const activityResult = new ActivityResult()

    activityResult.activity_id = activity_id
    activityResult.type = type
    activityResult.action = action

    if (is_now)
      activityResult.is_now = is_now

    activityResult.tgt_num = tgt_num
    activityResult.sub_dt_tm = sub_dt_tm
    activityResult.status = status

    if (resp_org)
     activityResult.resp_org = resp_org

    if (message)
     activityResult.message = message

    if (tgt_eff_dt_tm)
      activityResult.tgt_eff_dt_tm = tgt_eff_dt_tm

    if (tgt_tmpl_name)
      activityResult.tgt_tmpl_name = tgt_tmpl_name

    activityResult.user_id = profile.user.id!
    activityResult.updated_at = new Date().toISOString()

    await this.activityResultRepository.create(activityResult)
  }



  async searchAndReserve(req: NSRRequest, profile: AuthorizedUserProfile): Promise<any> {
    let payload: any = {}
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let specificNums = null
    let success_responses: any[] = []

    let nsr_req: NsrReq = new NsrReq()
    nsr_req.user_id = profile.user.id!
    nsr_req.ro_id = req.ro
    nsr_req.type = req.type
    nsr_req.submit_type = req.submitType
    nsr_req.completed = 0;
    nsr_req.failed = 0;
    nsr_req.status = PROGRESSING_STATUS.IN_PROGRESS
    nsr_req.sub_dt_tm = new Date().toISOString()
    nsr_req.updated_at = new Date().toISOString()

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.NumberSearchAndReserve
    activity.operation = req.submitType == NSR_SUBMIT_TYPE.SEARCH ? PAGE_OPERATION.SEARCH : PAGE_OPERATION.RESERVE
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = nsr_req.sub_dt_tm
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()

    if (req.type == NSR_TYPE.RANDOM || req.type == NSR_TYPE.WILDCARD) {
      if (req.npa!=null && req.npa!="") {
        payload.npa = req.npa
        nsr_req.npa = req.npa
      }

      if (req.nxx!=null && req.nxx!="") {
        payload.nxx = req.nxx
        nsr_req.nxx = req.nxx
      }

      if (req.line!=null && req.line!="") {
        payload.line = req.line
        nsr_req.line = req.line
      }

      if (req.cons!=null && req.cons!="") {
        payload.cons = req.cons
        nsr_req.consecutive = req.cons
      }

      nsr_req.total = req.qty!
      total = req.qty!
    }
    else{
      nsr_req.total = req.specificNums?.length!
      total = req.specificNums?.length!
    }

    if (req.type == NSR_TYPE.WILDCARD) {
      payload.wildCardNum = req.wildCardNum
      nsr_req.wild_card_num = req.wildCardNum
    }

    if (req.type == NSR_TYPE.SPECIFIC) {
      specificNums = req.specificNums
      payload.withVanity = "N"
      nsr_req.specific_num = JSON.stringify(req.specificNums)
    }

    nsr_req = await this.nsrReqRepository.create(nsr_req)
    if (!nsr_req)
      throw new HttpErrors.BadRequest("Failed to create activity")

    activity.total = total
    activity.completed = completed
    activity.failed = failed
    activity.req_id = nsr_req.id

    activity = await this.activityRepository.create(activity)
    if (!activity)
      throw new HttpErrors.BadRequest("Failed to create activity")

    this.messageQueueService.pushNSR(activity, nsr_req)

    while (total>0) {
      if (req.type == NSR_TYPE.RANDOM || req.type == NSR_TYPE.WILDCARD) {
        payload.qty = total > REQ_SIZE ? REQ_SIZE : total
        total -= REQ_SIZE

      } else {
        if (specificNums!=null && specificNums.length>REQ_SIZE) {
          payload.numList = specificNums.splice(0, REQ_SIZE)
          total -= REQ_SIZE
          payload.qty = REQ_SIZE

        } else if (specificNums!=null) {
          payload.numList = specificNums
          total -= specificNums.length
          payload.qty = specificNums.length
        }
      }

      let response: any = null;

      if (req.submitType == NSR_SUBMIT_TYPE.SEARCH) {
        if (req.type == NSR_TYPE.RANDOM)
          response = await this.tfnRegistryApiService.searchRandomNumbers(req.ro, payload, profile)

        if (req.type == NSR_TYPE.WILDCARD)
          response = await this.tfnRegistryApiService.searchWildcardNumbers(req.ro, payload, profile)

        if (req.type == NSR_TYPE.SPECIFIC)
          response = await this.tfnRegistryApiService.searchSpecificNumbers(req.ro, payload, profile)

      }
      else if (req.submitType == NSR_SUBMIT_TYPE.SEARCH_RESERVE) {
        payload.conName = req.contactName
        payload.conTel = req.contactNumber

        if (req.type == NSR_TYPE.RANDOM)
          response = await this.tfnRegistryApiService.searchAndReserveRandomNumbers(req.ro, payload, profile)

        if (req.type == NSR_TYPE.WILDCARD)
          response = await this.tfnRegistryApiService.searchAndReserveWildcardNumbers(req.ro, payload, profile)

        if (req.type == NSR_TYPE.SPECIFIC)
          response = await this.tfnRegistryApiService.searchAndReserveSpecificNumbers(req.ro, payload, profile)
      }

      console.log(response)

      if (response==null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
      }
      else if (response.errList!=null) {
        if (response.errList.length>0) {
          const error: any = response.errList[0];
          error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
        } else
          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

        failed += payload.qty
      }
      else if (response.code!=null && response.message!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
      }
      else if (response.reqId!=null) {
        let reqId = response.reqId

        while (response==null || response.numList==null) {
          await DataUtils.sleep(1000)

          response = null
          if (req.submitType == NSR_SUBMIT_TYPE.SEARCH) {
            if (nsr_req.type == NSR_TYPE.RANDOM)
              response = await this.tfnRegistryApiService.retrieveSearchRandomNumbers(nsr_req.ro_id!, reqId, profile)

            if (nsr_req.type == NSR_TYPE.WILDCARD)
              response = await this.tfnRegistryApiService.retrieveSearchWildcardNumbers(nsr_req.ro_id!, reqId, profile)

            if (nsr_req.type == NSR_TYPE.SPECIFIC)
              response = await this.tfnRegistryApiService.retrieveSearchSpecificNumbers(nsr_req.ro_id!, reqId, profile)

          } else if (req.submitType == NSR_SUBMIT_TYPE.SEARCH_RESERVE) {
            if (req.type == NSR_TYPE.RANDOM)
              response = await this.tfnRegistryApiService.retrieveSearchAndReserveRandomNumbers(req.ro, payload, profile)

            if (req.type == NSR_TYPE.WILDCARD)
              response = await this.tfnRegistryApiService.retrieveSearchAndReserveWildcardNumbers(req.ro, payload, profile)

            if (req.type == NSR_TYPE.SPECIFIC)
              response = await this.tfnRegistryApiService.retrieveSearchAndReserveSpecificNumbers(req.ro, payload, profile)
          }

          console.log(response)
        }

        completed += payload.qty; // response.numList.length

        success_responses.push(response)

      } else if (response.blkId!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, "Request is in progress. " + "blkId: " + response.blkId)

      } else if (response.numList!=null) {
        completed += payload.qty; // response.numList.length

        success_responses.push(response)
      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      // save progress to nsr_req
      nsr_req.completed = completed;
      nsr_req.failed = failed;
      nsr_req.status = PROGRESSING_STATUS.IN_PROGRESS
      nsr_req.message = error_message
      nsr_req.updated_at = new Date().toISOString()
      await this.nsrReqRepository.save(nsr_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushNSR(activity, nsr_req)
      await DataUtils.sleep(1000)
    }

    nsr_req.status = PROGRESSING_STATUS.COMPLETED
    if (nsr_req.total == nsr_req.failed)
      nsr_req.status = PROGRESSING_STATUS.FAILED
    else if (nsr_req.total == nsr_req.completed)
      nsr_req.status = PROGRESSING_STATUS.SUCCESS
    nsr_req.updated_at = new Date().toISOString()
    await this.nsrReqRepository.save(nsr_req)

    activity.status = nsr_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    await this.saveNSRResult(nsr_req, success_responses, activity, profile)

    this.messageQueueService.pushNSR(activity, nsr_req)

    return nsr_req
  }

  private async saveNSRResult(nsr_req: NsrReq, responses: any[], activity: Activity, profile: AuthorizedUserProfile): Promise<void> {
    for (const response of responses) {
      if (response.numList == null)
        continue

      let index = 0
      for (const item of response.numList) {
        let nsr_result = new NsrResult()
        nsr_result.req_id = nsr_req.id
        nsr_result.sub_dt_tm = nsr_req.sub_dt_tm
        nsr_result.num = item
        nsr_result.status = nsr_req.submit_type == NSR_SUBMIT_TYPE.SEARCH ? NUMBER_STATUS.SPARE : NUMBER_STATUS.RESERVED

        if (response.suggestdNumList!=null && response.suggestdNumList.length>index) {
          if (response.suggestdNumList[index]!=null && response.suggestdNumList[index].sggestedNum!=null) {
            nsr_result.suggested_num = response.suggestdNumList[index].sggestedNum
            nsr_result.message = MESSAGES.HAVE_SUGGESTED_NUMBER
          }
        }

        nsr_result.updated_at = new Date().toISOString()
        await this.nsrResultRepository.create(nsr_result)

        await this.saveNumber(profile, item,
            nsr_req.submit_type==NSR_SUBMIT_TYPE.SEARCH ? NUMBER_STATUS.SPARE : NUMBER_STATUS.RESERVED,
            nsr_req.sub_dt_tm!, NSR_SUBMIT_TYPE.SEARCH_RESERVE ? nsr_req.ro_id : "")

        // TODO - adjust task's type, action
        await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, nsr_req.submit_type==NSR_SUBMIT_TYPE.SEARCH ? TASK_ACTION.SEARCH : TASK_ACTION.RESERVE,
            item, nsr_result.sub_dt_tm!, nsr_result.status, nsr_req.ro_id, nsr_result.message)

        index++
      }
    }
  }


  async numberQuery(req: NQURequest, profile: AuthorizedUserProfile) {
    let result = null
    let message = ""

    let response = await this.tfnRegistryApiService.queryNumberData(req.ro, { numList: [ req.num ] }, profile)
    console.log(response)

    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE
    }
    else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR
    }
    else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")
    }
    else if (response.blkId!=null) {
      message = "Request is in progress. " + "blkId: " + response.blkId
    }
    else if (response.reqId!=null) {
      let reqId = response.reqId

      while (response==null || response.errList!=null || response.queryResult==null) {
        await DataUtils.sleep(1000)

        response = await this.tfnRegistryApiService.retrieveNumberData(req.ro, reqId, profile)
        console.log(response)
      }

      result = response.queryResult[0]
    }
    else if (response.queryResult!=null && response.queryResult.length>0) {
      result = response.queryResult[0]
    }
    else {
      message = MESSAGES.INTERNAL_SERVER_ERROR
    }

    if (result!=null) {
      // await this.saveResultFromNQU(type, req, activity, result, profile)
      return result
    }

    throw new HttpErrors.BadRequest(message)
  }

  async numberUpdate(req: NQURequest, profile: AuthorizedUserProfile) {
    let result = null
    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.NumberQueryAndUpdate
    activity.operation = PAGE_OPERATION.UPDATE
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = new Date().toISOString()
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()
    activity.total = 1
    activity = await this.activityRepository.create(activity)

    this.messageQueueService.pushNQU(activity, {})

    let payload: any = {
      tfNumList: [{num: req.num, recVersionId: req.recVersionId}],
      conName: req.contactName, conPhone: req.contactNumber, shrtNotes: req.shortNotes
    }
    let response = await this.tfnRegistryApiService.updateNumber(req.ro, payload, profile)
    console.log(response)

    if (response==null) {
      activity.message = MESSAGES.EMPTY_RESPONSE
      activity.status = PROGRESSING_STATUS.FAILED
      activity.failed = 1
    }
    else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        activity.message = error.errMsg + " Code: " + error.errCode
      } else
        activity.message = MESSAGES.INTERNAL_SERVER_ERROR

      activity.status = PROGRESSING_STATUS.FAILED
      activity.failed = 1
    }
    else if (response.code!=null && response.message!=null) {
      activity.message = response.message + (response.code!="" ? " Code: " + response.code : "")
      activity.status = PROGRESSING_STATUS.FAILED
      activity.failed = 1

    }
    else if (response.blkId!=null) {
      activity.message = "Request is in progress. " + "blkId: " + response.blkId
      activity.status = PROGRESSING_STATUS.FAILED
      activity.failed = 1

    }
    else if (response.reqId!=null) {
      let reqId = response.reqId

      while (response==null || response.errList!=null || response.updateResult==null) {
        await DataUtils.sleep(1000)

        response = await this.tfnRegistryApiService.retrieveUpdateNumber(req.ro, reqId, profile)

        console.log(response)
      }

      // TODO - confirm response.  maybe api document is wrong.
      result = response.updateResult[0]

      activity.status = PROGRESSING_STATUS.SUCCESS
      activity.completed = 1
    }
    else if (response.updateResult!=null && response.updateResult.length>0) {
      result = response.updateResult[0]

      activity.status = PROGRESSING_STATUS.SUCCESS
      activity.completed = 1
    }
    else {
      activity.message = MESSAGES.INTERNAL_SERVER_ERROR
      activity.status = PROGRESSING_STATUS.FAILED
      activity.failed = 1
    }

    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    this.messageQueueService.pushNQU(activity, {})

    if (result!=null) {
      await this.saveNQUResult(req, activity, result, profile)
      return result
    }

    throw new HttpErrors.BadRequest(activity.message)
  }

  private async saveNQUResult(req: NQURequest, activity: Activity, result: any, profile: AuthorizedUserProfile) {
    await this.saveNumber(profile, result.num, req.status!, activity.sub_dt_tm!, req.ro)

    let message = ""
    if (result.errList!=null) {
      if (result.errList.length>0) {
        const error: any = result.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.UPDATE, result.num, activity.sub_dt_tm!, req.status!, req.ro, message)
  }


  async queryTroubleReferralNumber(req: TRQRequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let success_responses: any[] = []
    let payload: any = {}

    total = req.numList.length

    let trq_req = new TrqReq()
    trq_req.user_id = profile.user.id!
    trq_req.num_list = JSON.stringify(req.numList)
    trq_req.ro_id = req.ro
    trq_req.total = total
    trq_req.status = PROGRESSING_STATUS.IN_PROGRESS
    trq_req.sub_dt_tm = new Date().toISOString()
    trq_req.updated_at = new Date().toISOString()

    trq_req = await this.trqReqRepository.create(trq_req)

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.TroubleReferralNumberQuery
    activity.operation = PAGE_OPERATION.RETRIEVE
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = new Date().toISOString()
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()
    activity.total = total
    activity.req_id = trq_req.id
    activity = await this.activityRepository.create(activity)

    this.messageQueueService.pushTRQ(activity, trq_req)

    while (total>0) {
      if (numList.length>REQ_SIZE) {
        payload.numList = numList.splice(0, REQ_SIZE)
        total -= REQ_SIZE
      } else {
        payload.numList = numList
        total -= REQ_SIZE
      }

      payload.qty = payload.numList.length

      let response = await this.tfnRegistryApiService.queryTroubleReferralNumber(req.ro, payload.numList.join(","), profile)
      console.log(response)

      if (response==null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
      }
      else if (response.errList!=null) {
        if (response.errList.length>0) {
          const error: any = response.errList[0];
          error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
        } else
          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

        failed += payload.qty

      }
      else if (response.code!=null && response.message!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
      }
      else if (response.reqId!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, "Request is in progress. " + "reqId: " + response.reqId)

      } else if (response.blkId!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, "Request is in progress. " + "blkId: " + response.blkId)

      } else if (response.TRQResult!=null) {
        completed += payload.qty; // response.numList.length

        success_responses.push(response)
      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      // save progress to nsr_req
      trq_req.completed = completed;
      trq_req.failed = failed;
      trq_req.status = PROGRESSING_STATUS.IN_PROGRESS
      trq_req.message = error_message
      trq_req.updated_at = new Date().toISOString()
      await this.trqReqRepository.save(trq_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushTRQ(activity, trq_req)
      await DataUtils.sleep(1000)
    }

    trq_req.status = PROGRESSING_STATUS.COMPLETED
    if (trq_req.total == trq_req.failed)
      trq_req.status = PROGRESSING_STATUS.FAILED
    else if (trq_req.total == trq_req.completed)
      trq_req.status = PROGRESSING_STATUS.SUCCESS
    trq_req.updated_at = new Date().toISOString()
    await this.trqReqRepository.save(trq_req)

    activity.status = trq_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    await this.saveTRQResult(trq_req, success_responses, activity, profile)

    this.messageQueueService.pushTRQ(activity, trq_req)

    return trq_req
  }

  private async saveTRQResult(trq_req: TrqReq, responses: any[], activity: Activity, profile: AuthorizedUserProfile): Promise<void> {
    for (const response of responses) {
      if (response.TRQResult == null)
        continue

      for (const item of response.TRQResult) {
        let trq_result = new TrqResult()
        trq_result.req_id = trq_req.id
        trq_result.num = item.num

        if (item.respOrgId!=null)
          trq_result.resp_org_id = item.respOrgId

        if (item.respOrgName!=null)
          trq_result.resp_org_name = item.respOrgName

        if (item.refNum!=null)
          trq_result.ref_num = item.refNum

        if (item.errList!=null) {
          if (item.errList.length>0) {
            const error: any = item.errList[0];
            trq_result.message = error.errMsg + " Code: " + error.errCode
          } else
            trq_result.message = MESSAGES.INTERNAL_SERVER_ERROR

          trq_result.status = PROGRESSING_STATUS.FAILED
        } else
          trq_result.status = PROGRESSING_STATUS.SUCCESS

        trq_result.updated_at = new Date().toISOString()
        await this.trqResultRepository.create(trq_result)

        await this.saveActivityResult(profile, activity.id, TASK_TYPE.OTHER, TASK_ACTION.RETRIEVE, trq_result.num!, trq_req.sub_dt_tm!, trq_result.status, trq_result.resp_org_id, trq_result.message)
      }
    }
  }


  async queryMultipleNumberData(req: MNQRequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let success_responses: any[] = []
    let payload: any = {}

    total = req.numList.length

    let mnq_req = new MnqReq()
    mnq_req.user_id = profile.user.id!
    mnq_req.num_list = JSON.stringify(req.numList)
    mnq_req.request_desc = req.requestDesc
    mnq_req.ro_id = req.ro
    mnq_req.total = total
    mnq_req.status = PROGRESSING_STATUS.IN_PROGRESS
    mnq_req.sub_dt_tm = new Date().toISOString()
    mnq_req.updated_at = new Date().toISOString()

    mnq_req = await this.mnqReqRepository.create(mnq_req)

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.MultiDialNumberQuery
    activity.operation = PAGE_OPERATION.QUERY
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = new Date().toISOString()
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()
    activity.total = total
    activity.req_id = mnq_req.id

    activity = await this.activityRepository.create(activity)

    this.messageQueueService.pushMNQ(activity, mnq_req)

    payload.requestDesc = req.requestDesc
    payload.email = profile.user.email

    while (total>0) {
      if (numList.length>REQ_SIZE) {
        payload.numList = numList.splice(0, REQ_SIZE)
        total -= REQ_SIZE
      } else {
        payload.numList = numList
        total -= REQ_SIZE
      }

      payload.qty = payload.numList.length

      let response = await this.tfnRegistryApiService.queryNumberData(req.ro, payload, profile)
      console.log("MNQ", response)

      if (response==null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
      }
      else if (response.errList!=null) {
        if (response.errList.length>0) {
          const error: any = response.errList[0];
          error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
        } else
          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

        failed += payload.qty

      }
      else if (response.code!=null && response.message!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
      }
      else if (response.reqId!=null) {
        let reqId = response.reqId
        while (response==null || response.queryResult==null) {
          await DataUtils.sleep(1000)

          response = await this.tfnRegistryApiService.retrieveNumberData(req.ro, reqId, profile)
          console.log(response)
        }

        completed += payload.qty; // response.numList.length

        success_responses.push(response)
      } else if (response.blkId!=null) {
        let blkId = response.blkId
        while (response==null || response.queryResult==null) {
          await DataUtils.sleep(1000)

          response = await this.tfnRegistryApiService.queryNumberDataByBulkID(req.ro, blkId, profile)
          console.log(response)
        }

        completed += payload.qty; // response.numList.length

        success_responses.push(response)
      } else if (response.queryResult!=null) {
        completed += payload.qty; // response.numList.length

        success_responses.push(response)
      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      // save progress to nsr_req
      mnq_req.completed = completed;
      mnq_req.failed = failed;
      mnq_req.status = PROGRESSING_STATUS.IN_PROGRESS
      mnq_req.message = error_message
      mnq_req.updated_at = new Date().toISOString()
      await this.mnqReqRepository.save(mnq_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushMNQ(activity, mnq_req)
      await DataUtils.sleep(1000)
    }

    mnq_req.status = PROGRESSING_STATUS.COMPLETED
    if (mnq_req.total == mnq_req.failed)
      mnq_req.status = PROGRESSING_STATUS.FAILED
    else if (mnq_req.total == mnq_req.completed)
      mnq_req.status = PROGRESSING_STATUS.SUCCESS
    mnq_req.updated_at = new Date().toISOString()
    await this.mnqReqRepository.save(mnq_req)

    activity.status = mnq_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    await this.saveMNQResult(mnq_req, success_responses, activity, profile)

    this.messageQueueService.pushMNQ(activity, mnq_req)

    return mnq_req
  }

  private async saveMNQResult(mnq_req: MnqReq, responses: any[], activity: Activity, profile: AuthorizedUserProfile): Promise<void> {
    for (const response of responses) {
      if (response.queryResult == null)
        continue

      for (const item of response.queryResult) {
        let mnq_result = new MnqResult()
        mnq_result.req_id = mnq_req.id
        mnq_result.num = item.num
        mnq_result.status = item.status

        if (item.ctrlRespOrgId!=null)
          mnq_result.resp_org_id = item.ctrlRespOrgId

        if (item.lastActDt!=null)
          mnq_result.last_act_dt = item.lastActDt

        if (item.resUntilDt!=null)
          mnq_result.res_until_dt = item.resUntilDt

        if (item.discUntilDt!=null)
          mnq_result.disc_until_dt = item.discUntilDt

        if (item.effDt!=null)
          mnq_result.eff_dt = item.effDt

        if (item.conName!=null)
          mnq_result.con_name = item.conName

        if (item.conPhone!=null)
          mnq_result.con_phone = item.conPhone

        if (item.shrtNotes!=null)
          mnq_result.short_notes = item.shrtNotes

        if (item.errList!=null) {
          if (item.errList.length>0) {
            const error: any = item.errList[0];
            mnq_result.message = error.errMsg + " Code: " + error.errCode
          } else
            mnq_result.message = MESSAGES.INTERNAL_SERVER_ERROR
        }

        mnq_result.updated_at = new Date().toISOString()
        await this.mnqResultRepository.create(mnq_result)

        // TODO - do not saved in java version
        await this.saveNumber(profile, mnq_result.num!, mnq_result.status!, mnq_req.sub_dt_tm!, mnq_result.resp_org_id)

        await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.RETRIEVE, mnq_result.num!, mnq_req.sub_dt_tm!, mnq_result.status!, mnq_result.resp_org_id, mnq_result.message, mnq_result.eff_dt)
      }
    }
  }


  async disconnectNumber(req: MNDRequest, profile: AuthorizedUserProfile): Promise<any> {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let success_responses: any[] = []
    let payload: any = {}

    total = req.numList.length

    let mnd_req = new MndReq()
    mnd_req.user_id = profile.user.id!
    mnd_req.num_list = JSON.stringify(req.numList)
    mnd_req.request_desc = req.requestDesc
    mnd_req.start_eff_dt_tm = req.startEffDtTm
    mnd_req.referral = req.referral
    if (req.endInterceptDt!=null && req.endInterceptDt!="") {
      mnd_req.end_intercept_dt = req.endInterceptDt
      payload.endInterceptDt = req.endInterceptDt
    }

    mnd_req.ro_id = req.ro
    mnd_req.total = total
    mnd_req.status = PROGRESSING_STATUS.IN_PROGRESS
    mnd_req.sub_dt_tm = new Date().toISOString()
    mnd_req.updated_at = new Date().toISOString()

    mnd_req = await this.mndReqRepository.create(mnd_req)

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.MultiDialNumberDisconnect
    activity.operation = PAGE_OPERATION.DISCONNECT
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = new Date().toISOString()
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()
    activity.total = total
    activity.req_id = mnd_req.id

    activity = await this.activityRepository.create(activity)

    this.messageQueueService.pushMND(activity, mnd_req)

    payload.requestDesc = req.requestDesc
    payload.email = profile.user.email
    payload.startEffDtTm = req.startEffDtTm
    payload.referral = req.referral

    while (total>0) {
      if (numList.length>REQ_SIZE) {
        payload.numList = numList.splice(0, REQ_SIZE)
        total -= REQ_SIZE
      } else {
        payload.numList = numList
        total -= REQ_SIZE
      }

      payload.qty = payload.numList.length

      let response = await this.tfnRegistryApiService.createMultiNumberDisconnectForNumber(req.ro, payload, profile)
      console.log(response)

      if (response==null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
      }
      else if (response.errList!=null) {
        if (response.errList.length>0) {
          const error: any = response.errList[0];
          error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
        } else
          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

        failed += payload.qty

      }
      else if (response.code!=null && response.message!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
      }
      else if (response.reqId!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, "Request is in progress. " + "reqId: " + response.reqId)

      } else if (response.blkId!=null) {
        let blkId = response.blkId
        while (response==null || response.disconnectResult==null) {
          await DataUtils.sleep(1000)

          response = await this.tfnRegistryApiService.createMultiNumberDisconnectForNumberByBlkID(req.ro, blkId, profile)
          console.log(response)
        }

        completed += payload.qty; // response.numList.length
        success_responses.push(response)
      } else if (response.disconnectResult!=null) {
        completed += payload.qty; // response.numList.length

        success_responses.push(response)
      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      // save progress to nsr_req
      mnd_req.completed = completed;
      mnd_req.failed = failed;
      mnd_req.status = PROGRESSING_STATUS.IN_PROGRESS
      mnd_req.message = error_message
      mnd_req.updated_at = new Date().toISOString()
      await this.mndReqRepository.save(mnd_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushMND(activity, mnd_req)
      await DataUtils.sleep(1000)
    }

    mnd_req.status = PROGRESSING_STATUS.COMPLETED
    if (mnd_req.total == mnd_req.failed)
      mnd_req.status = PROGRESSING_STATUS.FAILED
    else if (mnd_req.total == mnd_req.completed)
      mnd_req.status = PROGRESSING_STATUS.SUCCESS
    mnd_req.updated_at = new Date().toISOString()
    await this.mndReqRepository.save(mnd_req)

    activity.status = mnd_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    await this.saveMNDResult(mnd_req, success_responses, activity, profile)

    this.messageQueueService.pushMND(activity, mnd_req)

    return mnd_req
  }

  private async saveMNDResult(mnd_req: MndReq, responses: any[], activity: Activity, profile: AuthorizedUserProfile): Promise<void> {
    for (const response of responses) {
      if (response.disconnectResult == null)
        continue

      for (const item of response.disconnectResult) {
        let mnd_result = new MndResult()
        mnd_result.req_id = mnd_req.id
        mnd_result.num = item.num
        mnd_result.status = item.status

        if (item.tmplName!=null)
          mnd_result.template_name = item.tmplName

        if (item.effDtTm!=null)
          mnd_result.eff_dt_tm = item.effDtTm

        if (item.failReason!=null) {
          if (item.failReason.length>0) {
            const error: any = item.failReason[0];
            mnd_result.message = error.errMsg + " Code: " + error.errCode
          } else
            mnd_result.message = MESSAGES.INTERNAL_SERVER_ERROR
        }

        mnd_result.updated_at = new Date().toISOString()
        await this.mndResultRepository.create(mnd_result)

        if (mnd_result.status!="FAILED")
          await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.DISCONNECT, mnd_result.num!, mnd_req.sub_dt_tm!, mnd_result.status!,
            response.respOrgId, mnd_result.message, mnd_result.eff_dt_tm, mnd_result.template_name, mnd_req.start_eff_dt_tm=="NOW")
      }
    }
  }


  async spareMultipleNumber(req: MNSRequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let success_responses: any[] = []
    let queryResult = null
    let payload: any = {}

    total = req.numList.length

    let mns_req = new MnsReq()
    mns_req.user_id = profile.user.id!
    mns_req.num_list = JSON.stringify(req.numList)
    mns_req.request_desc = req.requestDesc
    mns_req.ro_id = req.ro
    mns_req.total = total
    mns_req.status = PROGRESSING_STATUS.IN_PROGRESS
    mns_req.sub_dt_tm = new Date().toISOString()
    mns_req.updated_at = new Date().toISOString()

    mns_req = await this.mnsReqRepository.create(mns_req)

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.MultiDialNumberSpare
    activity.operation = PAGE_OPERATION.SPARE
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = new Date().toISOString()
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()
    activity.total = total
    activity.req_id = mns_req.id

    activity = await this.activityRepository.create(activity)

    this.messageQueueService.pushMNS(activity, mns_req)

    payload.requestDesc = req.requestDesc
    payload.email = profile.user.email

    while (total>0) {
      if (numList.length>REQ_SIZE) {
        payload.numList = numList.splice(0, REQ_SIZE)
        total -= REQ_SIZE
      } else {
        payload.numList = numList
        total -= REQ_SIZE
      }

      payload.qty = payload.numList.length

      queryResult = null
      let response = await this.tfnRegistryApiService.queryNumberData(req.ro, payload, profile)
      console.log("MNS", response)

      if (response==null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
      }
      else if (response.errList!=null) {
        if (response.errList.length>0) {
          const error: any = response.errList[0];
          error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
        } else
          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

        failed += payload.qty

      }
      else if (response.code!=null && response.message!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
      }
      else if (response.reqId!=null) {
        let reqId = response.reqId
        while (response==null || response.queryResult==null) {
          await DataUtils.sleep(1000)

          response = await this.tfnRegistryApiService.retrieveNumberData(req.ro, reqId, profile)
          console.log(response)
        }

        queryResult = response.queryResult
      } else if (response.blkId!=null) {
        let blkId = response.blkId
        while (response==null || response.queryResult==null) {
          await DataUtils.sleep(1000)

          response = await this.tfnRegistryApiService.queryNumberDataByBulkID(req.ro, blkId, profile)
          console.log(response)
        }

        queryResult = response.queryResult
      } else if (response.queryResult!=null) {
        queryResult = response.queryResult

      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      // query succeed
      if (queryResult!=null) {
        let queryResults = await this.getMNSResult(mns_req, queryResult, activity, profile)
        failed += payload.qty - queryResults.length

        success_responses = success_responses.concat(queryResults)
      }

      // save progress
      mns_req.completed = completed;
      mns_req.failed = failed;
      mns_req.status = PROGRESSING_STATUS.IN_PROGRESS
      mns_req.message = error_message
      mns_req.updated_at = new Date().toISOString()
      await this.mnsReqRepository.save(mns_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushMNS(activity, mns_req)
      await DataUtils.sleep(1000)
    }

    for (const mns_result of success_responses) {
      let payload: any = {
        tfNumList: [{num: mns_result.num, recVersionId: mns_result.rec_version_id}],
        status: NUMBER_STATUS.SPARE,
      }

      queryResult = null
      let reason = ""
      let response = await this.tfnRegistryApiService.updateNumber(req.ro, payload, profile)
      console.log(response)

      if (response==null) {
        failed += 1

        error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
        reason = MESSAGES.EMPTY_RESPONSE
      }
      else if (response.errList!=null) {
        reason = MESSAGES.INTERNAL_SERVER_ERROR
        if (response.errList.length>0) {
          const error: any = response.errList[0];
          error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
          reason = error.errMsg + " Code: " + error.errCode
        } else
          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

        failed += 1
      }
      else if (response.code!=null && response.message!=null) {
        failed += 1

        error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
        reason = response.message + (response.code!="" ? " Code: " + response.code : "")
      }
      else if (response.reqId!=null) {
        let reqId = response.reqId

        while (response==null || response.errList!=null || response.updateResult==null) {
          await DataUtils.sleep(1000)

          response = await this.tfnRegistryApiService.retrieveUpdateNumber(req.ro, reqId, profile)

          console.log(response)
        }

        queryResult = response.updateResult[0]

      } else if (response.blkId!=null) {
        failed += 1

        error_message = this.appendErrorMessage(error_message, "Request is in progress. " + "blkId: " + response.blkId)
        reason = "Request is in progress. " + "blkId: " + response.blkId

      } else if (response.updateResult!=null) {
        queryResult = response.updateResult[0]

      } else {
        failed += 1

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
        reason = MESSAGES.INTERNAL_SERVER_ERROR
      }

      if (queryResult!=null) {
        completed += 1;

        mns_result.status = NUMBER_STATUS.SPARE
        mns_result.message = reason
        mns_result.updated_at = new Date().toISOString()
        await this.mnsResultRepository.create(mns_result)

        await this.saveNumber(profile, mns_result.num!, mns_result.status!, mns_req.sub_dt_tm!, mns_result.resp_org_id)

        await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.SPARE, mns_result.num, activity.sub_dt_tm!, mns_req.status!, mns_result.resp_org_id, reason)
      }

      // save progress
      mns_req.completed = completed;
      mns_req.failed = failed;
      mns_req.status = PROGRESSING_STATUS.IN_PROGRESS
      mns_req.message = error_message
      mns_req.updated_at = new Date().toISOString()
      await this.mnsReqRepository.save(mns_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushMNS(activity, mns_req)
      await DataUtils.sleep(1000)
    }

    mns_req.status = PROGRESSING_STATUS.COMPLETED
    if (mns_req.total == mns_req.failed)
      mns_req.status = PROGRESSING_STATUS.FAILED
    else if (mns_req.total == mns_req.completed)
      mns_req.status = PROGRESSING_STATUS.SUCCESS
    mns_req.updated_at = new Date().toISOString()
    await this.mnsReqRepository.save(mns_req)

    activity.status = mns_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    this.messageQueueService.pushMNS(activity, mns_req)

    return mns_req
  }

  private async getMNSResult(mns_req: MnsReq, queryResult: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any[]> {
    let result: any[] = []

    for (const item of queryResult) {
      let mns_result = new MnsResult()
      mns_result.req_id = mns_req.id
      mns_result.num = item.num
      mns_result.status = item.status

      if (item.ctrlRespOrgId != null)
        mns_result.resp_org_id = item.ctrlRespOrgId

      if (item.lastActDt != null)
        mns_result.last_act_dt = item.lastActDt

      if (item.resUntilDt != null)
        mns_result.res_until_dt = item.resUntilDt

      if (item.discUntilDt != null)
        mns_result.disc_until_dt = item.discUntilDt

      if (item.effDt != null)
        mns_result.eff_dt = item.effDt

      if (item.conName != null)
        mns_result.con_name = item.conName

      if (item.conPhone != null)
        mns_result.con_phone = item.conPhone

      if (item.shrtNotes != null)
        mns_result.short_notes = item.shrtNotes

      if (item.recVersionId != null)
        mns_result.rec_version_id = item.recVersionId

      if (item.errList != null) {
        if (item.errList.length > 0) {
          const error: any = item.errList[0];
          mns_result.message = error.errMsg + " Code: " + error.errCode
        } else
          mns_result.message = MESSAGES.INTERNAL_SERVER_ERROR

        mns_result.updated_at = new Date().toISOString()
        await this.mnsResultRepository.create(mns_result)

        await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.SPARE, mns_result.num!, activity.sub_dt_tm!, mns_req.status!, mns_result.resp_org_id, mns_result.message)
      } else {
        result.push(mns_result)
      }
    }

    return result
  }


  async changeRespOrg(req: MRORequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let success_responses: any[] = []
    let payload: any = {}

    total = req.numList.length

    let mro_req = new MroReq()
    mro_req.user_id = profile.user.id!
    mro_req.num_list = JSON.stringify(req.numList)
    mro_req.request_desc = req.requestDesc

    mro_req.ro_id = req.ro
    mro_req.new_ro_id = req.new_ro
    mro_req.total = total
    mro_req.status = PROGRESSING_STATUS.IN_PROGRESS
    mro_req.sub_dt_tm = new Date().toISOString()
    mro_req.updated_at = new Date().toISOString()

    mro_req = await this.mroReqRepository.create(mro_req)

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.MultiDialNumberRespOrgChange
    activity.operation = PAGE_OPERATION.CHANGE
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = new Date().toISOString()
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()
    activity.total = total
    activity.req_id = mro_req.id

    activity = await this.activityRepository.create(activity)

    this.messageQueueService.pushMRO(activity, mro_req)

    payload.requestDesc = req.requestDesc
    payload.email = profile.user.email
    payload.ctrlRespOrgId =  req.new_ro

    while (total>0) {
      if (numList.length>REQ_SIZE) {
        payload.numList = numList.splice(0, REQ_SIZE)
        total -= REQ_SIZE
      } else {
        payload.numList = numList
        total -= REQ_SIZE
      }

      payload.qty = payload.numList.length

      let response = await this.tfnRegistryApiService.changeRespOrgOfTollFreeNumber(req.ro, payload, profile)
      console.log(response)

      if (response==null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
      }
      else if (response.errList!=null) {
        if (response.errList.length>0) {
          const error: any = response.errList[0];
          error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
        } else
          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

        failed += payload.qty

      }
      else if (response.code!=null && response.message!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
      }
      else if (response.reqId!=null) {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, "Request is in progress. " + "reqId: " + response.reqId)

      } else if (response.blkId!=null) {
        let blkId = response.blkId
        while (response==null || response.mroResult==null) {
          await DataUtils.sleep(1000)

          response = await this.tfnRegistryApiService.changeRespOrgOfTollFreeNumberByBlkId(req.ro, blkId, profile)
          console.log(response)
        }

        completed += payload.qty; // response.numList.length
        success_responses.push(response)
      } else if (response.mroResult!=null) {
        completed += payload.qty; // response.numList.length

        success_responses.push(response.mroResult)
      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      // save progress to nsr_req
      mro_req.completed = completed;
      mro_req.failed = failed;
      mro_req.status = PROGRESSING_STATUS.IN_PROGRESS
      mro_req.message = error_message
      mro_req.updated_at = new Date().toISOString()
      await this.mroReqRepository.save(mro_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushMRO(activity, mro_req)
      await DataUtils.sleep(1000)
    }

    mro_req.status = PROGRESSING_STATUS.COMPLETED
    if (mro_req.total == mro_req.failed)
      mro_req.status = PROGRESSING_STATUS.FAILED
    else if (mro_req.total == mro_req.completed)
      mro_req.status = PROGRESSING_STATUS.SUCCESS
    mro_req.updated_at = new Date().toISOString()
    await this.mroReqRepository.save(mro_req)

    activity.status = mro_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    await this.saveMROResult(mro_req, success_responses, activity, profile)

    this.messageQueueService.pushMRO(activity, mro_req)

    return mro_req
  }

  private async saveMROResult(mro_req: MroReq, responses: any[], activity: Activity, profile: AuthorizedUserProfile): Promise<void> {
    for (const response of responses) {
      if (response.mroResult == null)
        continue

      for (const item of response.mroResult) {
        let mro_result = new MroResult()
        mro_result.req_id = mro_req.id
        mro_result.num = item.num
        mro_result.status = item.status

        if (item.failReason!=null) {
          if (item.failReason.length>0) {
            const error: any = item.failReason[0];
            mro_result.message = error.errMsg + " Code: " + error.errCode
          } else
            mro_result.message = MESSAGES.INTERNAL_SERVER_ERROR
        }

        mro_result.updated_at = new Date().toISOString()
        await this.mroResultRepository.create(mro_result)

        // if (mro_result.status!="FAILED")
          await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.CHANGE, mro_result.num!, mro_req.sub_dt_tm!, mro_result.status!,
              response.newRespOrgId, mro_result.message)
      }
    }
  }

  async convertToPointerRecord(req: MCPRequest, profile: AuthorizedUserProfile): Promise<any> {

  }

}
