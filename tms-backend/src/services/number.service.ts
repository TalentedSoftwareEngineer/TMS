import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {
  Activity,
  AuthorizedUserProfile,
  NsrReq,
  NsrResult,
  Numbers,
  ActivityResult,
  TrqReq,
  TrqResult,
  MnqResult,
  MnqReq,
  MndReq,
  MndResult,
  MnsReq,
  MnsResult,
  MCPRequest,
  McpReq,
  McpResult,
  OCARequest,
  OcaReq,
  OcaResult, MNARequest, MnaReq, MnaResult, ScriptResult
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
  MnsReqRepository,
  MnsResultRepository,
  MroReqRepository,
  MroResultRepository,
  McpReqRepository,
  McpResultRepository,
  OcaReqRepository, OcaResultRepository, MnaReqRepository, MnaResultRepository, ScriptResultRepository
} from "../repositories";
import {HttpErrors} from "@loopback/rest";
import DataUtils from "../utils/data";
import {NSRRequest} from "../models/nsr.request";
import {MESSAGES} from "../constants/messages";
import {
  NSR_SUBMIT_TYPE,
  NSR_TYPE,
  NUMBER_STATUS, PAGE_OPERATION,
  PROGRESSING_STATUS, SCRIPT_TYPE, TASK_ACTION, TASK_TYPE
} from "../constants/number_adminstration";
import {MessageQueueService} from "./message-queue.service";
import {PAGES} from "../constants/pages";
import {NQURequest} from "../models/nqu.request";
import {REQ_SIZE, SUPER_ADMIN} from "../constants/configurations";
import {TRQRequest} from "../models/trq.request";
import {MNQRequest} from "../models/mnq.request";
import {MNDRequest} from "../models/mnd.request";
import {MNSRequest} from "../models/mns.request";
import {MRORequest} from "../models/mro.request";
import {MroReq} from "../models/mro-req.model";
import {MroResult} from "../models/mro-result.model";
import {MailService} from "./mail.service";
import {Secure382ApiService} from "./secure-382-api.service";
import {FtpService} from "./ftp.service";
import * as fs from "fs";
import {SCRIPT_HOME, TEMPORARY} from "../config";

@injectable({scope: BindingScope.TRANSIENT})
export class NumberService {
  constructor(
      @service(TfnRegistryApiService)
      public tfnRegistryApiService: TfnRegistryApiService,
      @service(MessageQueueService)
      public messageQueueService: MessageQueueService,
      @service(MailService)
      public mailService: MailService,
      @service(Secure382ApiService)
      public secure382ApiService: Secure382ApiService,
      @service(FtpService)
      public ftpService: FtpService,
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
      @repository(McpReqRepository)
      public mcpReqRepository: McpReqRepository,
      @repository(McpResultRepository)
      public mcpResultRepository: McpResultRepository,
      @repository(OcaReqRepository)
      public ocaReqRepository: OcaReqRepository,
      @repository(OcaResultRepository)
      public ocaResultRepository: OcaResultRepository,
      @repository(MnaReqRepository)
      public mnaReqRepository: MnaReqRepository,
      @repository(MnaResultRepository)
      public mnaResultRepository: MnaResultRepository,
      @repository(NumbersRepository)
      public numbersRepository: NumbersRepository,
      @repository(ScriptResultRepository)
      public scriptResultRepository: ScriptResultRepository,
      @repository(ActivityRepository)
      public activityRepository: ActivityRepository,
      @repository(ActivityResultRepository)
      public activityResultRepository: ActivityResultRepository,
  ) {}

  private appendErrorMessage(error_message: string, new_msg: string): string {
    if (error_message!=null) {
      const errors: string[] = error_message.split("\n\n");
      if (errors.includes(new_msg))
        return error_message
    } else
      error_message = ""

    if (error_message!="")
      error_message += "\n\n"
    error_message += new_msg

    return error_message
  }

  private async saveNumber(profile?: AuthorizedUserProfile, num?: string, status?: string, sub_dt_tm?: string, resp_org?: string, template_name?: string, eff_dt_tm?: string, last_act_dt?: string, res_until_dt?: string, disc_until_dt?: string) {
    let created_by = profile ? profile.user.id : SUPER_ADMIN
    let created_at = new Date().toISOString()
    let isNew = false

    let numObj: any = await this.numbersRepository.findOne({where: {num: num}})
    if (numObj) {
      if (status && status==NUMBER_STATUS.SPARE) {
        await this.numbersRepository.deleteById(numObj.id)
        return
      }
    } else {
      isNew = true
      numObj = new Numbers()
      numObj.num = num
      numObj.created_at = created_at
      numObj.created_by = created_by
    }

    numObj.user_id = profile ? profile.user.id : SUPER_ADMIN

    if (resp_org!=null) {
      numObj.entity = resp_org.substring(0, 2)
      numObj.resp_org = resp_org
    }

    if (template_name!=null)
      numObj.template_name = template_name;

    if (eff_dt_tm!=null)
      numObj.eff_dt_tm = eff_dt_tm
    if (last_act_dt!=null)
      numObj.last_act_dt = last_act_dt
    if (res_until_dt!=null)
      numObj.res_until_dt = res_until_dt
    if (disc_until_dt!=null)
      numObj.disc_until_dt = disc_until_dt

    if (sub_dt_tm!=null)
      numObj.sub_dt_tm = sub_dt_tm

    if (status!=null)
      numObj.status = status

    numObj.updated_at = new Date().toISOString()
    numObj.updated_by = profile? profile.user.id! : SUPER_ADMIN

    return isNew ? this.numbersRepository.create(numObj) : this.numbersRepository.save(numObj)
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
    let apiResult: any

    let blkIds = []

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
      // payload.withVanity = "N"
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

    let req_size = 10
    if (req.submitType != NSR_SUBMIT_TYPE.SEARCH)
      req_size = 500

    while (total>0) {
      if (req.type == NSR_TYPE.RANDOM || req.type == NSR_TYPE.WILDCARD) {
        payload.qty = total > req_size ? req_size : total
        total -= req_size

      } else {
        if (specificNums!=null && specificNums.length>req_size) {
          payload.numList = specificNums.splice(0, req_size)
          total -= req_size
          payload.qty = req_size

        } else if (specificNums!=null) {
          payload.numList = specificNums
          total -= specificNums.length
          payload.qty = specificNums.length
        }
      }

      apiResult = null
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

      console.log("NSR", response)

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
          await DataUtils.sleep(100)

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
              response = await this.tfnRegistryApiService.retrieveSearchAndReserveRandomNumbers(req.ro, reqId, profile)

            if (req.type == NSR_TYPE.WILDCARD)
              response = await this.tfnRegistryApiService.retrieveSearchAndReserveWildcardNumbers(req.ro, reqId, profile)

            if (req.type == NSR_TYPE.SPECIFIC)
              response = await this.tfnRegistryApiService.retrieveSearchAndReserveSpecificNumbers(req.ro, reqId, profile)
          }

          console.log("NSR Req", response)
        }

        apiResult = response

      }
      else if (response.blkId!=null) {
        let blkId = response.blkId
        blkIds.push({blkId, qty: payload.qty})

      }
      else if (response.numList!=null) {
        apiResult = response

      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      if (apiResult!=null) {
        let result = await this.saveNSRResult(nsr_req, apiResult, activity, profile)
        console.log("NSR Result", result)

        failed += result.code
        completed += payload.qty - result.code
        error_message = this.appendErrorMessage(error_message, result.message)
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
      await DataUtils.sleep(100)
    }

    let timeout = blkIds.length * 40
    while (blkIds.length>0) {
      let res = await this.tfnRegistryApiService.listBulkRequest(req.ro, profile)
      console.log("NSR list bulk", res)

      if (res!=null && res.blkList!=null) {
        for (let blk of res.blkList) {
          if (blk.reqType=="NSR" && (blk.status=="COMPLETED" || blk.status=="FAILED")) {
            const blkIndex = blkIds.findIndex(row => row.blkId==blk.blkId)
            if (blkIndex==-1)
              continue
            const bulk: any = blkIds.splice(blkIndex, 1)[0]

            apiResult = null
            const response = await this.tfnRegistryApiService.retrieveBulkSearchAndReserve(req.ro, blk.blkId, profile)
            if (response==null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
            }
            else if (response.errList!=null) {
              if (response.errList.length>0) {
                const error: any = response.errList[0];
                error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
              } else
                error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

              failed += bulk.qty
            }
            else if (response.code!=null && response.message!=null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
            } else if (response.numList!=null) {
              apiResult = response

            } else {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
            }

            if (apiResult!=null) {
              let result = await this.saveNSRResult(nsr_req, apiResult, activity, profile)
              console.log("NSR Result", result)

              failed += result.code
              completed += bulk.qty - result.code
              error_message = this.appendErrorMessage(error_message, result.message)
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
            await DataUtils.sleep(100)
          }
        }
      }

      await DataUtils.sleep(3000)

      timeout--
      if (timeout<0) {
        // TODO - timeout error
        error_message = this.appendErrorMessage(error_message, "Bulk Request Timeout Exception")
        nsr_req.message = error_message
        break
      }
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

    this.messageQueueService.pushNSR(activity, nsr_req)

    return nsr_req
  }

  private async saveNSRResult(nsr_req: NsrReq, response: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let failed = 0, error_message = "";
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

    return { code: failed, message: error_message };
  }


  async numberQuery(req: NQURequest, profile: AuthorizedUserProfile) {
    let result = null
    let message = ""

    let sub_dt_tm = new Date().toISOString()

    let response = await this.tfnRegistryApiService.queryNumberData(req.ro, { numList: [ req.num ] }, profile)
    console.log("NQU", response)

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
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.queryNumberDataByReqId(req.ro, reqId, profile)
        console.log("NQU Req", response)
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
      // TODO - save number from Query Result.
      // await this.saveNumber(profile, req.num, req.status!, sub_dt_tm, req.ro)
      // await this.saveResultFromNQU(type, req, activity, result, profile)
      return result
    }

    throw new HttpErrors.BadRequest(message)
  }

  async numberUpdate(req: NQURequest, profile: AuthorizedUserProfile) {
    let apiResult: any
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

    apiResult = null
    let response = await this.tfnRegistryApiService.updateNumber(req.ro, payload, profile)
    console.log("NQU", response)

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
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.updateNumberByReqId(req.ro, reqId, profile)
        console.log("NQU Req", response)
      }

      // TODO - confirm response.  maybe api document is wrong.
      apiResult = response.updateResult[0]

      activity.status = PROGRESSING_STATUS.SUCCESS
      activity.completed = 1
    }
    else if (response.updateResult!=null) {
      apiResult = response.updateResult[0]

    }
    else {
      activity.message = MESSAGES.INTERNAL_SERVER_ERROR
      activity.status = PROGRESSING_STATUS.FAILED
      activity.failed = 1
    }

    if (apiResult!=null) {
      let result = await this.saveNQUResult(req, activity, apiResult, profile)
      console.log("NQU Result", result)

      if (result.code>0)
        activity.failed = 1
      else
        activity.completed = 1

      activity.message = result.message
    }

    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    this.messageQueueService.pushNQU(activity, {})

    if (activity.completed>0)
      return apiResult;

    throw new HttpErrors.BadRequest(activity.message)
  }

  private async saveNQUResult(req: NQURequest, activity: Activity, result: any, profile: AuthorizedUserProfile) {
    let failed = 0, error_message = "";

    let message = ""
    if (result.failReason!=null || result.errList!=null) {
      if (result.failReason!=null && result.failReason.length>0) {
        const error: any = result.failReason[0];
        message = error.errMsg + " Code: " + error.errCode

      } else if (result.errList!=null && result.errList.length>0) {
        const error: any = result.errList[0];
        message = error.errMsg + " Code: " + error.errCode

      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      failed++
      error_message = this.appendErrorMessage(error_message, message)
    }
    else
      await this.saveNumber(profile, result.num, req.status!, activity.sub_dt_tm!, req.ro)

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.UPDATE, result.num, activity.sub_dt_tm!, req.status!, req.ro, message)

    return { code: failed, message: error_message };
  }


  async queryTroubleReferralNumber(req: TRQRequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let payload: any = {}
    let apiResult: any

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

      apiResult = null
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
        apiResult = response

      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      if (apiResult!=null) {
        let result = await this.saveTRQResult(trq_req, apiResult, activity, profile)
        console.log("TRQ Result", result)

        failed += result.code
        completed += payload.qty - result.code
        error_message = this.appendErrorMessage(error_message, result.message)
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
      await DataUtils.sleep(10)
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

    this.messageQueueService.pushTRQ(activity, trq_req)

    return trq_req
  }

  private async saveTRQResult(trq_req: TrqReq, response: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let result: any[] = []
    let failed = 0, error_message = "";
    if (response.TRQResult!=null)
      result = response.TRQResult

    for (const item of result) {
      let trq_result = new TrqResult()
      trq_result.req_id = trq_req.id
      trq_result.num = item.num

      if (item.respOrgId!=null)
        trq_result.resp_org_id = item.respOrgId

      if (item.respOrgName!=null)
        trq_result.resp_org_name = item.respOrgName

      if (item.refNum!=null)
        trq_result.ref_num = item.refNum

      if (item.failReason!=null || item.errList!=null) {
        if (item.failReason!=null && item.failReason.length>0) {
          const error: any = item.failReason[0];
          trq_result.message = error.errMsg + " Code: " + error.errCode

        } else if (item.errList!=null && item.errList.length>0) {
          const error: any = item.errList[0];
          trq_result.message = error.errMsg + " Code: " + error.errCode

        } else
          trq_result.message = MESSAGES.INTERNAL_SERVER_ERROR

        trq_result.status = PROGRESSING_STATUS.FAILED

        failed++
        error_message = this.appendErrorMessage(error_message, trq_result.message)
      } else {
        trq_result.status = PROGRESSING_STATUS.COMPLETED
      }

      trq_result.updated_at = new Date().toISOString()
      await this.trqResultRepository.create(trq_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.OTHER, TASK_ACTION.RETRIEVE, trq_result.num!, trq_req.sub_dt_tm!, trq_result.status, trq_result.resp_org_id, trq_result.message)
    }

    return { code: failed, message: error_message };
  }


  async queryMultipleNumberData(req: MNQRequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let payload: any = {}
    let apiResult: any

    let blkIds = []

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

    const req_size = 500

    while (total>0) {
      if (numList.length>req_size) {
        payload.numList = numList.splice(0, req_size)
        total -= req_size
      } else {
        payload.numList = numList
        total -= req_size
      }

      payload.qty = payload.numList.length

      apiResult = null
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
          await DataUtils.sleep(100)

          response = await this.tfnRegistryApiService.queryNumberDataByReqId(req.ro, reqId, profile)
          console.log("MNQ Req", response)
        }

        apiResult = response

      }
      else if (response.blkId!=null) {
        let blkId = response.blkId
        blkIds.push({blkId, qty: payload.qty})

      } else if (response.queryResult!=null) {
        apiResult = response

      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      if (apiResult!=null) {
        let result = await this.saveMNQResult(mnq_req, apiResult, activity, profile)
        console.log("MNQ Result", result)

        failed += result.code
        completed += payload.qty - result.code
        error_message = this.appendErrorMessage(error_message, result.message)
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
      await DataUtils.sleep(10)
    }

    let timeout = blkIds.length * 40
    while (blkIds.length>0) {
      let res = await this.tfnRegistryApiService.listBulkRequest(req.ro, profile)
      console.log("MNQ list bulk", res)

      if (res!=null && res.blkList!=null) {
        for (let blk of res.blkList) {
          if (blk.reqType=="MNQ" && (blk.status=="COMPLETED" || blk.status=="FAILED")) {
            const blkIndex = blkIds.findIndex(row => row.blkId==blk.blkId)
            if (blkIndex==-1)
              continue
            const bulk: any = blkIds.splice(blkIndex, 1)[0]

            apiResult = null
            const response = await this.tfnRegistryApiService.queryNumberDataByBlkID(req.ro, blk.blkId, profile)
            if (response==null) {
              failed += bulk.qty
              error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
            }
            else if (response.errList!=null) {
              if (response.errList.length>0) {
                const error: any = response.errList[0];
                error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
              } else
                error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

              failed += bulk.qty

            }
            else if (response.code!=null && response.message!=null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
            } else if (response.queryResult!=null) {
              apiResult = response

            } else {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
            }

            if (apiResult!=null) {
              let result = await this.saveMNQResult(mnq_req, apiResult, activity, profile)
              console.log("MNQ Result", result)

              failed += result.code
              completed += bulk.qty - result.code
              error_message = this.appendErrorMessage(error_message, result.message)
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
            await DataUtils.sleep(10)
          }
        }
      }

      await DataUtils.sleep(3000)

      timeout--
      if (timeout<0) {
        // TODO - timeout error
        error_message = this.appendErrorMessage(error_message, "Bulk Request Timeout Exception")
        mnq_req.message = error_message
        break
      }
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

    this.messageQueueService.pushMNQ(activity, mnq_req)

    return mnq_req
  }

  private async saveMNQResult(mnq_req: MnqReq, response: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let result: any[] = []
    let failed = 0, error_message = "";
    if (response.queryResult!=null)
      result = response.queryResult

    for (const item of result) {
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

      if (item.failReason!=null || item.errList!=null) {
        if (item.failReason!=null && item.failReason.length>0) {
          const error: any = item.failReason[0];
          mnq_result.message = error.errMsg + " Code: " + error.errCode

        } else if (item.errList!=null && item.errList.length>0) {
          const error: any = item.errList[0];
          mnq_result.message = error.errMsg + " Code: " + error.errCode

        } else
          mnq_result.message = MESSAGES.INTERNAL_SERVER_ERROR

        mnq_result.status = PROGRESSING_STATUS.FAILED

        failed++
        error_message = this.appendErrorMessage(error_message, mnq_result.message)
      }
      else
        // TODO - do not saved in java version
        await this.saveNumber(profile, mnq_result.num!, mnq_result.status!, mnq_req.sub_dt_tm!, mnq_result.resp_org_id, undefined, mnq_result.eff_dt, mnq_result.last_act_dt, mnq_result.res_until_dt, mnq_result.disc_until_dt)

      mnq_result.updated_at = new Date().toISOString()
      await this.mnqResultRepository.create(mnq_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.RETRIEVE, mnq_result.num!, mnq_req.sub_dt_tm!, mnq_result.status!, mnq_result.resp_org_id, mnq_result.message, mnq_result.eff_dt)
    }

    return { code: failed, message: error_message };
  }


  async disconnectNumber(req: MNDRequest, profile: AuthorizedUserProfile): Promise<any> {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let payload: any = {}
    let apiResult: any
    let blkIds = []

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

    const num_req_limit = 20

    while (total>0) {
      if (numList.length>num_req_limit) {
        payload.numList = numList.splice(0, num_req_limit)
        total -= num_req_limit
      } else {
        payload.numList = numList
        total -= num_req_limit
      }

      payload.qty = payload.numList.length

      apiResult = null
      let response = await this.tfnRegistryApiService.createMultiNumberDisconnectForNumber(req.ro, payload, profile)
      console.log("MND", response)

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
        blkIds.push({blkId, qty: payload.qty})

      } else if (response.disconnectResult!=null) {
        apiResult = response

      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      if (apiResult!=null) {
        let result = await this.saveMNDResult(mnd_req, apiResult, activity, payload, profile)
        console.log("MND Result", result)

        failed += result.code
        completed += payload.qty - result.code
        error_message = this.appendErrorMessage(error_message, result.message)
      }

      // save progress
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
      await DataUtils.sleep(10)
    }

    let timeout = blkIds.length * 40
    while (blkIds.length>0) {
      let res = await this.tfnRegistryApiService.listBulkRequest(req.ro, profile)
      console.log("MND list bulk", res)

      if (res!=null && res.blkList!=null) {
        for (let blk of res.blkList) {
          if (blk.reqType=="MND" && (blk.status=="COMPLETED" || blk.status=="FAILED")) {
            const blkIndex = blkIds.findIndex(row => row.blkId==blk.blkId)
            if (blkIndex==-1)
              continue
            const bulk: any = blkIds.splice(blkIndex, 1)[0]

            apiResult = null
            const response = await this.tfnRegistryApiService.createMultiNumberDisconnectForNumberByBlkID(req.ro, blk.blkId, profile)
            console.log("MND Blk", response)

            if (response==null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
            }
            else if (response.errList!=null) {
              if (response.errList.length>0) {
                const error: any = response.errList[0];
                error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
              } else
                error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

              failed += bulk.qty

            }
            else if (response.code!=null && response.message!=null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))

            } else if (response.disconnectResult!=null) {
              apiResult = response

            } else {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
            }

            if (apiResult!=null) {
              let result = await this.saveMNDResult(mnd_req, apiResult, activity, payload, profile)
              console.log("MND Result", result)

              failed += result.code
              completed += bulk.qty - result.code
              error_message = this.appendErrorMessage(error_message, result.message)
            }

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
            await DataUtils.sleep(10)
          }
        }
      }

      await DataUtils.sleep(3000)

      timeout--
      if (timeout<0) {
        // TODO - timeout error
        error_message = this.appendErrorMessage(error_message, "Bulk Request Timeout Exception")
        mnd_req.message = error_message
        break
      }
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

    this.messageQueueService.pushMND(activity, mnd_req)

    return mnd_req
  }

  private async saveMNDResult(mnd_req: MndReq, response: any, activity: Activity, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    let result: any[] = []
    let failed = 0, error_message = "";
    if (response.disconnectResult!=null)
      result = response.disconnectResult

    for (const item of result) {
      let mnd_result = new MndResult()
      mnd_result.req_id = mnd_req.id
      mnd_result.num = item.num
      mnd_result.status = item.status

      if (item.tmplName!=null)
        mnd_result.template_name = item.tmplName

      if (item.effDtTm!=null)
        mnd_result.eff_dt_tm = item.effDtTm

      if (item.failReason!=null || item.errList!=null) {
        if (item.failReason!=null && item.failReason.length>0) {
          const error: any = item.failReason[0];
          mnd_result.message = error.errMsg + " Code: " + error.errCode

        } else if (item.errList!=null && item.errList.length>0) {
          const error: any = item.errList[0];
          mnd_result.message = error.errMsg + " Code: " + error.errCode

        } else
          mnd_result.message = MESSAGES.INTERNAL_SERVER_ERROR

        mnd_result.status = PROGRESSING_STATUS.FAILED

        failed++
        error_message = this.appendErrorMessage(error_message, mnd_result.message)

      } else {
        if (mnd_req.start_eff_dt_tm=="NOW")
          await this.saveNumber(profile, mnd_result.num!, NUMBER_STATUS.DISCONNECT, mnd_req.sub_dt_tm!, undefined, mnd_result.template_name, mnd_result.eff_dt_tm)
      }

      mnd_result.updated_at = new Date().toISOString()
      await this.mndResultRepository.create(mnd_result)

      // if (mnd_result.status!=PROGRESSING_STATUS.FAILED)
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.DISCONNECT, mnd_result.num!, mnd_req.sub_dt_tm!, mnd_result.status!,
        response.respOrgId, mnd_result.message, mnd_result.eff_dt_tm, mnd_result.template_name, mnd_req.start_eff_dt_tm=="NOW")
    }

    return { code: failed, message: error_message };
  }


  async spareMultipleNumber(req: MNSRequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let payload: any = {}
    let recVersionId = { code: '', message: '' }
    let apiResult: any

    let blkIds = []

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

    const req_size = 20

    while (total>0) {
      if (numList.length>req_size) {
        payload.numList = numList.splice(0, req_size)
        total -= req_size
      } else {
        payload.numList = numList
        total -= req_size
      }

      payload.qty = payload.numList.length
      if (payload.qty==1) {
        apiResult = null

        let response = await this.tfnRegistryApiService.queryNumberData(req.ro, payload, profile)
        console.log("MNS Query", response)

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
            await DataUtils.sleep(100)

            response = await this.tfnRegistryApiService.queryNumberDataByReqId(req.ro, reqId, profile)
            console.log("MNS Query Req", response)
          }

          apiResult = response.queryResult[0]
        } else if (response.blkId!=null) {
          let blkId = response.blkId
          while (response==null || response.queryResult==null) {
            await DataUtils.sleep(100)

            response = await this.tfnRegistryApiService.queryNumberDataByBlkID(req.ro, blkId, profile)
            console.log("MNS Query Blk", response)
          }

          apiResult = response.queryResult[0]
        } else if (response.queryResult!=null) {
          apiResult = response.queryResult[0]

        } else {
          failed += payload.qty

          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
        }

        if (apiResult!=null) {
          recVersionId = await this.saveMNSResultForQuery(mns_req, apiResult, activity, profile)
          if (recVersionId.code=='') {
            failed++;
            error_message = this.appendErrorMessage(error_message, recVersionId.message)
          }
        }
      }

      let tfNumList: any[] = [];
      if (payload.qty==1)
        tfNumList = payload.numList.map((num: string) => {
          return {
            recVersionId: recVersionId.code,
            num
          }
        })
      else
        tfNumList = payload.numList.map((num: string) => {
          return {
            num
          }
        })

      apiResult = null
      if (payload.qty>1 || recVersionId.code!="") {
        let response = await this.tfnRegistryApiService.updateNumber(req.ro, {
          tfNumList,
          status: NUMBER_STATUS.SPARE,
          requestDesc: req.requestDesc,
        }, profile)
        console.log("MNS Update", response)

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

          while (response==null || response.updateResult==null) {
            await DataUtils.sleep(100)

            response = await this.tfnRegistryApiService.updateNumberByReqId(req.ro, reqId, profile)
            console.log("MNS Update Req", response)
          }

          apiResult = response;
        } else if (response.blkId!=null) {
          let blkId = response.blkId
          blkIds.push({blkId, qty: payload.qty})

        } else if (response.updateResult!=null) {
          apiResult = response;

        } else {
          failed += payload.qty

          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
        }
      }

      if (apiResult!=null) {
        let result = await this.saveMNSResult(mns_req, apiResult, activity, profile)
        console.log("MNS Result", result)

        failed += result.code
        completed += payload.qty - result.code
        error_message = this.appendErrorMessage(error_message, result.message)
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
      await DataUtils.sleep(10)
    }

    let timeout = blkIds.length * 40
    while (blkIds.length>0) {
      let res = await this.tfnRegistryApiService.listBulkRequest(req.ro, profile)
      console.log("MND list bulk", res)

      if (res!=null && res.blkList!=null) {
        for (let blk of res.blkList) {
          if (blk.reqType=="MSP" && (blk.status=="COMPLETED" || blk.status=="FAILED")) {
            const blkIndex = blkIds.findIndex(row => row.blkId==blk.blkId)
            if (blkIndex==-1)
              continue
            const bulk: any = blkIds.splice(blkIndex, 1)[0]

            apiResult = null
            const response = await this.tfnRegistryApiService.retrieveNumberSpareByBlkID(req.ro, blk.blkId, profile)
            console.log("MNS Update Blk", response)
            if (response==null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
            }
            else if (response.errList!=null) {
              if (response.errList.length>0) {
                const error: any = response.errList[0];
                error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
              } else
                error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

              failed += bulk.qty
            }
            else if (response.code!=null && response.message!=null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
            } else if (response.updateResult!=null) {
              apiResult = response;

            } else {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
            }

            if (apiResult!=null) {
              let result = await this.saveMNSResult(mns_req, apiResult, activity, profile)
              console.log("MNS Result", result)

              failed += result.code
              completed += bulk.qty - result.code
              error_message = this.appendErrorMessage(error_message, result.message)
            }
          }
        }
      }

      await DataUtils.sleep(3000)

      timeout--
      if (timeout<0) {
        // TODO - timeout error
        error_message = this.appendErrorMessage(error_message, "Bulk Request Timeout Exception")
        mns_req.message = error_message
        break
      }
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

  private async saveMNSResultForQuery(mns_req: MnsReq, queryResult: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let error_message = ""

    if (queryResult.errList != null || queryResult.failReason != null || queryResult.recVersionId==null) {
      let mns_result = new MnsResult()
      mns_result.req_id = mns_req.id
      mns_result.num = queryResult.num
      mns_result.status = PROGRESSING_STATUS.FAILED; // queryResult.status

      if (queryResult.errList != null && queryResult.errList.length > 0) {
        const error: any = queryResult.errList[0];
        mns_result.message = error.errMsg + " Code: " + error.errCode

      } else if (queryResult.failReason!=null && queryResult.failReason.length>0) {
        const error: any = queryResult.failReason[0];
        mns_result.message = error.errMsg + " Code: " + error.errCode

      } else if (queryResult.recVersionId==null) {
        mns_result.message = "Query Result have not Timestamp(recVersionId)."

      } else
        mns_result.message = MESSAGES.INTERNAL_SERVER_ERROR

      error_message = mns_result.message
      mns_result.updated_at = new Date().toISOString()
      await this.mnsResultRepository.create(mns_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.UPDATE, mns_result.num!, activity.sub_dt_tm!, mns_req.status!, undefined, mns_result.message)
    }

    return { code: queryResult.recVersionId !=null ? queryResult.recVersionId : "", message: error_message};
  }

  private async saveMNSResult(mns_req: MnsReq, response: any, activity: Activity, profile: AuthorizedUserProfile) {
    let result: any[] = []
    let failed = 0, error_message = "";
    if (response.updateResult!=null)
      result = response.updateResult
    else if (response.spareResult!=null)
      result = response.spareResult

    let newRespOrgId = mns_req.ro_id
    if (response.respOrgId!=null)
      newRespOrgId = response.respOrgId

    for (const item of result) {
      let mns_result = new MnsResult()
      mns_result.req_id = mns_req.id
      mns_result.num = item.num

      // spareResult have "status" field. = COMPLETED
      mns_result.status = NUMBER_STATUS.SPARE

      if (item.errList!=null || item.failReason!=null) {
        if (item.errList!=null && item.errList.length>0) {
          const error: any = item.errList[0];
          mns_result.message = error.errMsg + " Code: " + error.errCode

        } else if (item.failReason!=null && item.failReason.length>0) {
          const error: any = item.failReason[0];
          mns_result.message = error.errMsg + " Code: " + error.errCode

        } else
          mns_result.message = MESSAGES.INTERNAL_SERVER_ERROR

        mns_result.status = PROGRESSING_STATUS.FAILED;

        failed++
        error_message = this.appendErrorMessage(error_message, mns_result.message)
      } else {
        await this.saveNumber(profile, mns_result.num!, mns_result.status, mns_req.sub_dt_tm!, newRespOrgId)
      }

      mns_result.updated_at = new Date().toISOString()
      await this.mnsResultRepository.create(mns_result)

      // if (mro_result.status!="FAILED")
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.UPDATE, mns_result.num!, mns_req.sub_dt_tm!, mns_result.status!, newRespOrgId, mns_result.message)
    }

    return { code: failed, message: error_message };
  }


  async changeRespOrg(req: MRORequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let payload: any = {}
    let apiResult: any

    let blkIds = []

    total = req.numList.length

    let mro_req = new MroReq()
    mro_req.user_id = profile.user.id!
    mro_req.num_list = JSON.stringify(req.numList)
    mro_req.request_desc = req.requestDesc
    mro_req.new_ro_id = req.new_ro
    mro_req.ro_id = req.ro
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

    const req_size = 50

    while (total>0) {
      if (numList.length>req_size) {
        payload.numList = numList.splice(0, req_size)
        total -= req_size
      } else {
        payload.numList = numList
        total -= req_size
      }

      payload.qty = payload.numList.length

      apiResult = null
      let response = await this.tfnRegistryApiService.changeRespOrgOfTollFreeNumber(req.ro, payload, profile)
      console.log("MRO", response)

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
        blkIds.push({blkId, qty: payload.qty})

      } else if (response.mroResult!=null) {
        apiResult = response

      } else {
        failed += payload.qty

        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
      }

      if (apiResult!=null) {
        let result = await this.saveMROResult(mro_req, apiResult, activity, profile)
        console.log("MRO Result", result)

        failed += result.code
        completed += payload.qty - result.code
        error_message = this.appendErrorMessage(error_message, result.message)
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
      await DataUtils.sleep(10)
    }

    let timeout = blkIds.length * 40
    while (blkIds.length>0) {
      let res = await this.tfnRegistryApiService.listBulkRequest(req.ro, profile)
      console.log("MND list bulk", res)

      if (res!=null && res.blkList!=null) {
        for (let blk of res.blkList) {
          if (blk.reqType=="MRO" && (blk.status=="COMPLETED" || blk.status=="FAILED")) {
            const blkIndex = blkIds.findIndex(row => row.blkId==blk.blkId)
            if (blkIndex==-1)
              continue
            const bulk: any = blkIds.splice(blkIndex, 1)[0]

            apiResult = null
            const response = await this.tfnRegistryApiService.changeRespOrgOfTollFreeNumberByBlkId(req.ro, blk.blkId, profile)
            console.log("MRO Blk", response)

            if (response==null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
            }
            else if (response.errList!=null) {
              if (response.errList.length>0) {
                const error: any = response.errList[0];
                error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
              } else
                error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

              failed += bulk.qty

            }
            else if (response.code!=null && response.message!=null) {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))

            } else if (response.mroResult!=null) {
              apiResult = response

            } else {
              failed += bulk.qty

              error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
            }

            if (apiResult!=null) {
              let result = await this.saveMROResult(mro_req, apiResult, activity, profile)
              console.log("MRO Result", result)

              failed += result.code
              completed += bulk.qty - result.code
              error_message = this.appendErrorMessage(error_message, result.message)
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
            await DataUtils.sleep(10)
          }
        }
      }

      await DataUtils.sleep(3000)

      timeout--
      if (timeout<0) {
        // TODO - timeout error
        error_message = this.appendErrorMessage(error_message, "Bulk Request Timeout Exception")
        mro_req.message = error_message
        break
      }
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

    this.messageQueueService.pushMRO(activity, mro_req)

    return mro_req
  }

  private async saveMROResult(mro_req: MroReq, response: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let result: any[] = []
    let failed = 0, error_message = "";
    if (response.mroResult!=null)
      result = response.mroResult

    console.log("---------", result)

    let newRespOrgId = mro_req.new_ro_id
    if (response.newRespOrgId!=null)
      newRespOrgId = response.newRespOrgId

    for (const item of result) {
      console.log("MRO Item", item)

      let mro_result = new MroResult()
      mro_result.req_id = mro_req.id
      mro_result.num = item.num
      mro_result.status = item.status

      if (item.failReason!=null || item.errList!=null) {
        if (item.failReason!=null && item.failReason.length>0) {
          const error: any = item.failReason[0];
          mro_result.message = error.errMsg + " Code: " + error.errCode

        } else if (item.errList!=null && item.errList.length>0) {
          const error: any = item.errList[0];
          mro_result.message = error.errMsg + " Code: " + error.errCode

        } else
          mro_result.message = MESSAGES.INTERNAL_SERVER_ERROR

        mro_result.status = PROGRESSING_STATUS.FAILED

        failed++
        error_message = this.appendErrorMessage(error_message, mro_result.message)
        console.log("MRO Result", failed, error_message)
      } else {
        await this.saveNumber(profile, mro_result.num!, undefined, mro_req.sub_dt_tm, newRespOrgId)
      }

      mro_result.updated_at = new Date().toISOString()
      await this.mroResultRepository.create(mro_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.CHANGE, mro_result.num!, mro_req.sub_dt_tm!, mro_result.status!,
          newRespOrgId, mro_result.message)
    }

    return { code: failed, message: error_message };
  }


  async convertToPointerRecord(req: MCPRequest, profile: AuthorizedUserProfile) {
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let numList = req.numList
    let payload: any = {}
    let recVersionId = { code: '', message: '' }
    let apiResult: any

    let blkIds = []

    total = req.numList.length

    let mcp_req = new McpReq()
    mcp_req.user_id = profile.user.id!
    mcp_req.num_list = JSON.stringify(req.numList)
    mcp_req.request_desc = req.requestDesc
    mcp_req.template_name = req.templateName
    mcp_req.start_eff_dt_tm = req.startEffDtTm
    mcp_req.ro_id = req.ro
    mcp_req.total = total
    mcp_req.status = PROGRESSING_STATUS.IN_PROGRESS
    mcp_req.sub_dt_tm = new Date().toISOString()
    mcp_req.updated_at = new Date().toISOString()

    mcp_req = await this.mcpReqRepository.create(mcp_req)

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.MultiConversionToPointerRecord
    activity.operation = PAGE_OPERATION.CONVERT
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = new Date().toISOString()
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()
    activity.total = total
    activity.req_id = mcp_req.id

    activity = await this.activityRepository.create(activity)

    this.messageQueueService.pushMCP(activity, mcp_req)

    let response = await this.tfnRegistryApiService.queryTemplateRecord(req.ro, req.templateName, profile)
    if (response==null) {
      failed += req.numList.length

      error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
    }
    else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
      } else
        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

      failed += req.numList.length
    }
    else if (response.code!=null && response.message!=null) {
      failed += req.numList.length

      error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
    }
    else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.lstEffDtTms==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.queryTemplateRecordByReqId(req.ro, reqId, profile)
        console.log("MCP Template Req", response)
      }

      apiResult = response
    } else if (response.blkId!=null) {
      failed += req.numList.length

      error_message = this.appendErrorMessage(error_message, "Request is in Progress. BlkId: " + response.blkId)

    } else if (response.lstEffDtTms!=null) {
      apiResult = response.lstEffDtTms

    } else {
      failed += payload.qty

      error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
    }

    if (apiResult!=null) {
      payload.tmplName = req.templateName
      payload.requestDesc = req.requestDesc
      payload.tgtEffDtTm = req.startEffDtTm
      payload.email = profile.user.email

      const req_size = 50
      while (total>0) {
        if (numList.length>req_size) {
          payload.numList = numList.splice(0, req_size)
          total -= req_size
        } else {
          payload.numList = numList
          total -= req_size
        }

        payload.qty = payload.numList.length
        if (payload.qty==1) {
          apiResult = null

          let response = await this.tfnRegistryApiService.queryCustomerRecord(req.ro, payload.numList[0], profile) //payload.tgtEffDtTm
          console.log("MCP Query", response)

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
            while (response==null || response.lstEffDtTms==null) {
              await DataUtils.sleep(100)

              response = await this.tfnRegistryApiService.queryCustomerRecordByReqId(req.ro, reqId, profile)
              console.log("MNS Query Req", response)
            }

            apiResult = response
          } else if (response.blkId!=null) {
            failed += payload.qty

            error_message = this.appendErrorMessage(error_message, "Request is in progress. BlkId: " + response.blkId)
          } else if (response.lstEffDtTms!=null) {
            apiResult = response

          } else {
            failed += payload.qty

            error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
          }

          if (apiResult!=null) {
            recVersionId = await this.saveMCPResultForQuery(payload.numList[0], mcp_req, apiResult, activity, profile)
            if (recVersionId.code=='') {
              failed++;
              error_message = this.appendErrorMessage(error_message, recVersionId.message)
            }
          }
        }

        if (payload.qty==1)
          payload.recVersionId = recVersionId.code

        apiResult = null
        if (payload.qty>1 || recVersionId.code!="") {
          let response = await this.tfnRegistryApiService.convertCustomerRecordToPointerRecord(req.ro, payload, profile)
          console.log("MCP Convert", response)

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

            while (response==null || (response.mcpResult==null && response.effDtTm==null)) {
              await DataUtils.sleep(100)

              response = await this.tfnRegistryApiService.convertCustomerRecordToPointerRecordByReqId(req.ro, reqId, profile)
              console.log("MCP Convert Req", response)
            }

            apiResult = response;
          }
          else if (response.blkId!=null) {
            let blkId = response.blkId
            blkIds.push({blkId, qty: payload.qty})

          } else if (response.mcpResult!=null || response.effDtTm!=null) {
            apiResult = response;

          } else {
            failed += payload.qty

            error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
          }
        }

        if (apiResult!=null && apiResult.mcpResult!=null) {
          let result = await this.saveMCPResult(mcp_req, apiResult, activity, profile)
          console.log("MCP Result", result)

          failed += result.code
          completed += payload.qty - result.code
          error_message = this.appendErrorMessage(error_message, result.message)
        }
        else if (apiResult!=null && apiResult.effDtTm!=null) {
          let result = await this.saveMCPResultForEffDtTm(mcp_req, payload.numList, apiResult.effDtTm, activity, profile)
          console.log("MCP Result", result)

          failed += result.code
          completed += payload.qty - result.code
          error_message = this.appendErrorMessage(error_message, result.message)
        }

        // save progress
        mcp_req.completed = completed;
        mcp_req.failed = failed;
        mcp_req.status = PROGRESSING_STATUS.IN_PROGRESS
        mcp_req.message = error_message
        mcp_req.updated_at = new Date().toISOString()
        await this.mcpReqRepository.save(mcp_req)

        activity.completed = completed
        activity.failed = failed
        activity.status = PROGRESSING_STATUS.IN_PROGRESS
        activity.message = error_message
        activity.updated_at = new Date().toISOString()
        await this.activityRepository.save(activity)

        this.messageQueueService.pushMCP(activity, mcp_req)
        await DataUtils.sleep(10)
      }

      let timeout = blkIds.length * 40
      while (blkIds.length>0) {
        let res = await this.tfnRegistryApiService.listBulkRequest(req.ro, profile)
        console.log("MCP list bulk", res)

        if (res!=null && res.blkList!=null) {
          for (let blk of res.blkList) {
            if (blk.reqType=="MCP" && (blk.status=="COMPLETED" || blk.status=="FAILED")) {
              const blkIndex = blkIds.findIndex(row => row.blkId==blk.blkId)
              if (blkIndex==-1)
                continue
              const bulk: any = blkIds.splice(blkIndex, 1)[0]

              apiResult = null
              response = await this.tfnRegistryApiService.convertCustomerRecordToPointerRecordByBlkId(req.ro, blk.blkId, profile)
              console.log("MCP Conv Blk", response)
              if (response==null) {
                failed += bulk.qty

                error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
              }
              else if (response.errList!=null) {
                if (response.errList.length>0) {
                  const error: any = response.errList[0];
                  error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
                } else
                  error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

                failed += bulk.qty
              }
              else if (response.code!=null && response.message!=null) {
                failed += bulk.qty

                error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
              } else if (response.mcpResult!=null || response.effDtTm!=null) {
                apiResult = response;

              } else {
                failed += bulk.qty

                error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
              }

              if (apiResult!=null && apiResult.mcpResult!=null) {
                let result = await this.saveMCPResult(mcp_req, apiResult, activity, profile)
                console.log("MCP Result", result)

                failed += result.code
                completed += bulk.qty - result.code
                error_message = this.appendErrorMessage(error_message, result.message)
              }
              else if (apiResult!=null && apiResult.effDtTm!=null) {
                let result = await this.saveMCPResultForEffDtTm(mcp_req, payload.numList, apiResult.effDtTm, activity, profile)
                console.log("MCP Result", result)

                failed += result.code
                completed += payload.qty - result.code
                error_message = this.appendErrorMessage(error_message, result.message)
              }

              // save progress
              mcp_req.completed = completed;
              mcp_req.failed = failed;
              mcp_req.status = PROGRESSING_STATUS.IN_PROGRESS
              mcp_req.message = error_message
              mcp_req.updated_at = new Date().toISOString()
              await this.mcpReqRepository.save(mcp_req)

              activity.completed = completed
              activity.failed = failed
              activity.status = PROGRESSING_STATUS.IN_PROGRESS
              activity.message = error_message
              activity.updated_at = new Date().toISOString()
              await this.activityRepository.save(activity)

              this.messageQueueService.pushMCP(activity, mcp_req)
              await DataUtils.sleep(10)
            }
          }
        }

        await DataUtils.sleep(3000)

        timeout--
        if (timeout<0) {
          // TODO - timeout error
          error_message = this.appendErrorMessage(error_message, "Bulk Request Timeout Exception")
          mcp_req.message = error_message
          break
        }
      }

    }
    else {
      mcp_req.completed = completed;
      mcp_req.failed = failed;
      mcp_req.status = PROGRESSING_STATUS.IN_PROGRESS
      mcp_req.message = error_message
      mcp_req.updated_at = new Date().toISOString()
      await this.mcpReqRepository.save(mcp_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushMCP(activity, mcp_req)
      await DataUtils.sleep(10)

      // await this.saveMCPResultForAllFailed(req.numList, mcp_req, activity, profile)
    }

    mcp_req.status = PROGRESSING_STATUS.COMPLETED
    if (mcp_req.total == mcp_req.failed)
      mcp_req.status = PROGRESSING_STATUS.FAILED
    else if (mcp_req.total == mcp_req.completed)
      mcp_req.status = PROGRESSING_STATUS.SUCCESS
    mcp_req.updated_at = new Date().toISOString()
    await this.mcpReqRepository.save(mcp_req)

    activity.status = mcp_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    this.messageQueueService.pushMCP(activity, mcp_req)

    return mcp_req
  }

  private async saveMCPResultForAllFailed(nums: string[], mcp_req: McpReq, activity: Activity, profile: AuthorizedUserProfile) {
    for (const item of nums){
      let mcp_result = new McpResult()
      mcp_result.req_id = mcp_req.id
      mcp_result.num = item
      mcp_result.status = PROGRESSING_STATUS.FAILED
      mcp_result.message = activity.message

      mcp_result.updated_at = new Date().toISOString()
      await this.mcpResultRepository.create(mcp_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.CONVERT, mcp_result.num!, mcp_req.sub_dt_tm!, mcp_result.status!,
          undefined, mcp_result.message)
    }
  }

  private async saveMCPResultForQuery(num: string, mcp_req: McpReq, queryResult: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let error_message = ""

    if (queryResult.errList != null || queryResult.failReason != null || queryResult.recVersionId==null) {
      let mcp_result = new McpResult()
      mcp_result.req_id = mcp_req.id
      mcp_result.num = num
      mcp_result.status = PROGRESSING_STATUS.FAILED; // queryResult.status

      if (queryResult.errList != null && queryResult.errList.length > 0) {
        const error: any = queryResult.errList[0];
        mcp_result.message = error.errMsg + " Code: " + error.errCode

      } else if (queryResult.failReason!=null && queryResult.failReason.length>0) {
        const error: any = queryResult.failReason[0];
        mcp_result.message = error.errMsg + " Code: " + error.errCode

      } else if (queryResult.recVersionId==null) {
        mcp_result.message = "Query Result have not Timestamp(recVersionId)."

      } else
        mcp_result.message = MESSAGES.INTERNAL_SERVER_ERROR

      error_message = mcp_result.message
      mcp_result.updated_at = new Date().toISOString()
      await this.mcpResultRepository.create(mcp_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.CONVERT, mcp_result.num!, mcp_req.sub_dt_tm!, mcp_result.status!, undefined, mcp_result.message)
    }

    return { code: queryResult.recVersionId !=null ? queryResult.recVersionId : "", message: error_message};
  }

  private async saveMCPResult(mcp_req: McpReq, response: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let result: any[] = []
    let failed = 0, error_message = "";
    if (response.mcpResult!=null)
      result = response.mcpResult

    let newRespOrgId = null
    if (response.respOrgId!=null)
      newRespOrgId = response.respOrgId

    for (const item of result) {
      let mcp_result = new McpResult()
      mcp_result.req_id = mcp_req.id
      mcp_result.num = item.num
      if (response.effDtTm!=null)
        mcp_result.eff_dt_tm = response.effDtTm

      if (item.errList!=null || item.failReason!=null) {
        if (item.errList != null && item.errList.length > 0) {
          const error: any = item.errList[0];
          mcp_result.message = error.errMsg + " Code: " + error.errCode

        } else if (item.failReason!=null && item.failReason.length>0) {
          const error: any = item.failReason[0];
          mcp_result.message = error.errMsg + " Code: " + error.errCode

        } else
          mcp_result.message = MESSAGES.INTERNAL_SERVER_ERROR

        mcp_result.status = PROGRESSING_STATUS.FAILED

        failed++
        error_message = this.appendErrorMessage(error_message, mcp_result.message)
      } else {
        mcp_result.status = PROGRESSING_STATUS.COMPLETED

        // update number with new resp org and template name
        if (mcp_req.start_eff_dt_tm=="NOW")
          this.saveNumber(profile, mcp_result.num!, NUMBER_STATUS.WORKING, mcp_req.sub_dt_tm!, newRespOrgId, mcp_req.template_name, mcp_result.eff_dt_tm)
        // } else {
        //   this.saveNumber(profile, mcp_result.num!, NUMBER_STATUS.WORKING, mcp_req.sub_dt_tm!)
        // }
      }

      mcp_result.updated_at = new Date().toISOString()
      await this.mcpResultRepository.create(mcp_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.CONVERT, mcp_result.num!, mcp_req.sub_dt_tm!, mcp_result.status!, newRespOrgId, mcp_result.message, mcp_result.eff_dt_tm)
    }

    return { code: failed, message: error_message };
  }

  private async saveMCPResultForEffDtTm(mcp_req: McpReq, numList: string[], effDtTm: string, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let result: any[] = []
    let failed = 0, error_message = "";

    for (const item of numList) {
      let mcp_result = new McpResult()
      mcp_result.req_id = mcp_req.id
      mcp_result.num = item
      mcp_result.eff_dt_tm = effDtTm

      mcp_result.status = PROGRESSING_STATUS.COMPLETED

      if (mcp_req.start_eff_dt_tm=="NOW")
        this.saveNumber(profile, mcp_result.num!, NUMBER_STATUS.WORKING, mcp_req.sub_dt_tm!, undefined, mcp_req.template_name, mcp_result.eff_dt_tm)

      mcp_result.updated_at = new Date().toISOString()
      await this.mcpResultRepository.create(mcp_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.CONVERT, mcp_result.num!, mcp_req.sub_dt_tm!, mcp_result.status!, undefined, mcp_result.message, mcp_result.eff_dt_tm)
    }

    return { code: failed, message: error_message };
  }


  async oneClickActivate(req: OCARequest, profile: AuthorizedUserProfile): Promise<any> {
    let payload: any = {}
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let specificNums = null
    let apiResult: any
    let activatedNumbers: any[] = []

    let blkIds = []

    let oca_req: OcaReq = new OcaReq()
    oca_req.user_id = profile.user.id!
    oca_req.ro_id = req.ro
    oca_req.type = req.type
    oca_req.template_name = req.templateName
    oca_req.service_order = req.serviceOrder
    oca_req.num_term_line = req.numTermLine
    oca_req.eff_dt_tm = req.effDtTm
    oca_req.completed = 0;
    oca_req.failed = 0;
    oca_req.status = PROGRESSING_STATUS.IN_PROGRESS
    oca_req.sub_dt_tm = new Date().toISOString()
    oca_req.updated_at = new Date().toISOString()

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.OneClickActivate
    activity.operation = PAGE_OPERATION.ACTIVATE
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = oca_req.sub_dt_tm
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()

    payload.numTermLine = req.numTermLine
    payload.conName = req.contactName
    payload.conTel = req.contactNumber
    payload.tmplName = req.templateName
    payload.svcOrderNum = req.serviceOrder
    payload.effDtTm = req.effDtTm
    if (req.timezone!=null && req.timezone!="") {
      oca_req.timezone = req.timezone
      payload.timeZone = req.timezone
    }

    if (req.type == NSR_TYPE.RANDOM || req.type == NSR_TYPE.WILDCARD) {
      if (req.npa!=null && req.npa!="") {
        payload.npa = req.npa
        oca_req.npa = req.npa
      }

      if (req.nxx!=null && req.nxx!="") {
        payload.nxx = req.nxx
        oca_req.nxx = req.nxx
      }

      if (req.line!=null && req.line!="") {
        payload.line = req.line
        oca_req.line = req.line
      }

      if (req.cons!=null && req.cons!="") {
        payload.cons = req.cons
        oca_req.consecutive = req.cons
      }

      oca_req.total = req.qty!
      total = req.qty!
    }
    else{
      oca_req.total = req.specificNums?.length!
      total = req.specificNums?.length!
    }

    if (req.type == NSR_TYPE.WILDCARD) {
      payload.wildCardNum = req.wildCardNum
      oca_req.wild_card_num = req.wildCardNum
    }

    if (req.type == NSR_TYPE.SPECIFIC) {
      specificNums = req.specificNums
      // payload.withVanity = "N"
      oca_req.specific_num = JSON.stringify(req.specificNums)
    }

    oca_req = await this.ocaReqRepository.create(oca_req)
    if (!oca_req)
      throw new HttpErrors.BadRequest("Failed to create activity")

    activity.total = total
    activity.completed = completed
    activity.failed = failed
    activity.req_id = oca_req.id

    activity = await this.activityRepository.create(activity)
    if (!activity)
      throw new HttpErrors.BadRequest("Failed to create activity")

    this.messageQueueService.pushOCA(activity, oca_req)

    let response = await this.tfnRegistryApiService.queryTemplateRecord(req.ro, req.templateName, profile)
    console.log("OCA Tmpl", response)

    if (response==null) {
      failed += total

      error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
    }
    else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
      } else
        error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

      failed += total
    }
    else if (response.code!=null && response.message!=null) {
      failed += total

      error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
    }
    else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.lstEffDtTms==null) {
        await DataUtils.sleep(100)

        response = await this.tfnRegistryApiService.queryTemplateRecordByReqId(req.ro, reqId, profile)
        console.log("OCA Template Req", response)
      }

      apiResult = response
    } else if (response.blkId!=null) {
      failed += total

      error_message = this.appendErrorMessage(error_message, "Request is in Progress. BlkId: " + response.blkId)

    } else if (response.lstEffDtTms!=null) {
      apiResult = response.lstEffDtTms

    } else {
      failed += total

      error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
    }

    if (apiResult!=null) {
      while (total>0) {
        const req_size = 50

        if (req.type == NSR_TYPE.RANDOM || req.type == NSR_TYPE.WILDCARD) {
          payload.qty = total > req_size ? req_size : total
          total -= req_size

        } else {
          if (specificNums!=null && specificNums.length>req_size) {
            payload.numList = specificNums.splice(0, req_size)
            total -= req_size
            payload.qty = req_size

          } else if (specificNums!=null) {
            payload.numList = specificNums
            total -= specificNums.length
            payload.qty = specificNums.length
          }
        }

        apiResult = null

        if (req.type == NSR_TYPE.RANDOM)
          response = await this.tfnRegistryApiService.oneClickActivationRandomNumbers(req.ro, payload, profile)

        if (req.type == NSR_TYPE.WILDCARD)
          response = await this.tfnRegistryApiService.oneClickActivationWildcardNumbers(req.ro, payload, profile)

        if (req.type == NSR_TYPE.SPECIFIC)
          response = await this.tfnRegistryApiService.oneClickActivationSpecificNumbers(req.ro, payload, profile)

        console.log("OCA", response)

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

          while (response==null || response.resultList==null) {
            await DataUtils.sleep(100)

            response = null

            if (req.type == NSR_TYPE.RANDOM)
              response = await this.tfnRegistryApiService.oneClickActivationRandomNumbersByReqId(req.ro, reqId, profile)

            if (req.type == NSR_TYPE.WILDCARD)
              response = await this.tfnRegistryApiService.oneClickActivationWildcardNumbersByReqId(req.ro, reqId, profile)

            if (req.type == NSR_TYPE.SPECIFIC)
              response = await this.tfnRegistryApiService.oneClickActivationSpecificNumbersByReqId(req.ro, reqId, profile)

            console.log("OCA Req", response)
          }

          apiResult = response

        } else if (response.blkId!=null) {
          let blkId = response.blkId
          blkIds.push({blkId, qty: payload.qty})

        } else if (response.resultList!=null) {
          apiResult = response

        } else {
          failed += payload.qty

          error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
        }

        if (apiResult!=null) {
          let result:any = await this.saveOCAResult(oca_req, apiResult, activity, profile)
          console.log("OCA Result", result)

          failed += result.code
          completed += payload.qty - result.code
          error_message = this.appendErrorMessage(error_message, result.message)

          activatedNumbers = activatedNumbers.concat(result.list)
        }

        // save progress to nsr_req
        oca_req.completed = completed;
        oca_req.failed = failed;
        oca_req.status = PROGRESSING_STATUS.IN_PROGRESS
        oca_req.message = error_message
        oca_req.updated_at = new Date().toISOString()
        await this.ocaReqRepository.save(oca_req)

        activity.completed = completed
        activity.failed = failed
        activity.status = PROGRESSING_STATUS.IN_PROGRESS
        activity.message = error_message
        activity.updated_at = new Date().toISOString()
        await this.activityRepository.save(activity)

        this.messageQueueService.pushOCA(activity, oca_req)
        await DataUtils.sleep(10)
      }

      let timeout = blkIds.length * 40
      while (blkIds.length>0) {
        let res = await this.tfnRegistryApiService.listBulkRequest(req.ro, profile)
        console.log("MND list bulk", res)

        if (res!=null && res.blkList!=null) {
          for (let blk of res.blkList) {
            if (blk.reqType=="OCA" && (blk.status=="COMPLETED" || blk.status=="FAILED")) {
              const blkIndex = blkIds.findIndex(row => row.blkId==blk.blkId)
              if (blkIndex==-1)
                continue
              const bulk: any = blkIds.splice(blkIndex, 1)[0]

              apiResult = null
              response = await this.tfnRegistryApiService.oneClickActivationByBlkId(req.ro, blk.blkId, profile)
              console.log("OCA Blk", response)

              if (response==null) {
                failed += bulk.qty

                error_message = this.appendErrorMessage(error_message, MESSAGES.EMPTY_RESPONSE)
              }
              else if (response.errList!=null) {
                if (response.errList.length>0) {
                  const error: any = response.errList[0];
                  error_message = this.appendErrorMessage(error_message, error.errMsg + " Code: " + error.errCode)
                } else
                  error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)

                failed += bulk.qty
              }
              else if (response.code!=null && response.message!=null) {
                failed += bulk.qty

                error_message = this.appendErrorMessage(error_message, response.message + (response.code!="" ? " Code: " + response.code : ""))
              } else if (response.resultList!=null) {
                apiResult = response

              } else {
                failed += bulk.qty

                error_message = this.appendErrorMessage(error_message, MESSAGES.INTERNAL_SERVER_ERROR)
              }

              if (apiResult!=null) {
                let result:any = await this.saveOCAResult(oca_req, apiResult, activity, profile)
                console.log("OCA Result", result)

                failed += result.code
                completed += bulk.qty - result.code
                error_message = this.appendErrorMessage(error_message, result.message)

                activatedNumbers = activatedNumbers.concat(result.list)
              }

              // save progress to nsr_req
              oca_req.completed = completed;
              oca_req.failed = failed;
              oca_req.status = PROGRESSING_STATUS.IN_PROGRESS
              oca_req.message = error_message
              oca_req.updated_at = new Date().toISOString()
              await this.ocaReqRepository.save(oca_req)

              activity.completed = completed
              activity.failed = failed
              activity.status = PROGRESSING_STATUS.IN_PROGRESS
              activity.message = error_message
              activity.updated_at = new Date().toISOString()
              await this.activityRepository.save(activity)

              this.messageQueueService.pushOCA(activity, oca_req)
              await DataUtils.sleep(10)
            }
          }
        }

        await DataUtils.sleep(3000)

        timeout--
        if (timeout<0) {
          // TODO - timeout error
          error_message = this.appendErrorMessage(error_message, "Bulk Request Timeout Exception")
          oca_req.message = error_message
          break
        }
      }

    } else {
      oca_req.completed = completed;
      oca_req.failed = failed;
      oca_req.status = PROGRESSING_STATUS.IN_PROGRESS
      oca_req.message = error_message
      oca_req.updated_at = new Date().toISOString()
      await this.ocaReqRepository.save(oca_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushOCA(activity, oca_req)
      await DataUtils.sleep(10)

      // TODO - save all failed result or not (same as MCP)
    }

    oca_req.status = PROGRESSING_STATUS.COMPLETED
    if (oca_req.total == oca_req.failed)
      oca_req.status = PROGRESSING_STATUS.FAILED
    else if (oca_req.total == oca_req.completed)
      oca_req.status = PROGRESSING_STATUS.SUCCESS
    oca_req.updated_at = new Date().toISOString()
    await this.ocaReqRepository.save(oca_req)

    activity.status = oca_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    this.messageQueueService.pushOCA(activity, oca_req)

    if (activatedNumbers.length>0) {
      // send numbers to secure382.com to route
      await this.secure382ApiService.sendNumbers(req.ro!, activatedNumbers)
    }

    return oca_req
  }

  private async saveOCAResult(oca_req: OcaReq, response: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let failed = 0, error_message = "";
    let list = []

    for (const item of response.resultList) {
      let oca_result = new OcaResult()
      oca_result.req_id = oca_req.id
      oca_result.sub_dt_tm = oca_req.sub_dt_tm
      oca_result.num = item.num
      oca_result.status = item.status

      let effDtTm = ""

      if (item.failReason!=null || item.errList!=null) {
        if (item.failReason!=null && item.failReason.length>0) {
          const error: any = item.failReason[0];
          oca_result.message = error.errMsg + " Code: " + error.errCode

        } else if (item.errList!=null && item.errList.length>0) {
          const error: any = item.errList[0];
          oca_result.message = error.errMsg + " Code: " + error.errCode

        } else
          oca_result.message = MESSAGES.INTERNAL_SERVER_ERROR

        oca_result.status = PROGRESSING_STATUS.FAILED

        failed++
        error_message = this.appendErrorMessage(error_message, oca_result.message)
      } else {

        // TODO - check "NOW"
        if (oca_req.eff_dt_tm=="NOW")
          await this.saveNumber(profile, oca_result.num!,
              oca_result.status!,
              oca_result.sub_dt_tm!, oca_req.ro_id, oca_req.template_name)

        list.push(item.num)
      }

      let qpr: any = await this.tfnRegistryApiService.queryPointerRecord(oca_req.ro_id, oca_result.num!, oca_req.eff_dt_tm, profile)
      console.log("OCA QPR", qpr)

      if (qpr!=null && qpr.lstEffDtTms!=null) {
        effDtTm = qpr.lstEffDtTms[0].effDtTm
      }

      if (effDtTm=="")
        effDtTm = oca_req.eff_dt_tm


      oca_result.updated_at = new Date().toISOString()
      await this.ocaResultRepository.create(oca_result)

      await this.saveActivityResult(profile, activity.id, TASK_TYPE.NUM, TASK_ACTION.ACTIVATE,
          item, oca_result.sub_dt_tm!, oca_result.status!, oca_req.ro_id, oca_result.message, effDtTm, oca_req.template_name, oca_req.eff_dt_tm=="NOW")
    }

    return { code: failed, message: error_message, list };
  }

  async retrieveReservedNumberList(ro: string, profile: AuthorizedUserProfile) {
    let response = await this.tfnRegistryApiService.retrieveReservedNumberList(ro, profile)
    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)
    } else if (response.reqId!=null) {
      throw new HttpErrors.BadRequest("Request is in progress. reqId: " + response.reqId)

    } else if (response.numList!=null)
      return response.numList;

    throw new HttpErrors.InternalServerError
  }

  async activate(req: MNARequest, profile: AuthorizedUserProfile): Promise<any> {
    let payload: any = {}
    let total = 0, completed = 0, failed = 0;
    let error_message = "";
    let activatedNumbers: any[] = []

    let mna_req: MnaReq = new MnaReq()
    mna_req.user_id = profile.user.id!
    mna_req.ro_id = req.ro
    mna_req.num_list = JSON.stringify(req.numList)
    mna_req.template_name = req.templateName
    mna_req.service_order = req.serviceOrder
    mna_req.num_term_line = req.numTermLine
    mna_req.eff_dt_tm = req.effDtTm
    mna_req.completed = 0;
    mna_req.failed = 0;
    mna_req.status = PROGRESSING_STATUS.IN_PROGRESS
    mna_req.sub_dt_tm = new Date().toISOString()
    mna_req.updated_at = new Date().toISOString()

    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = PAGES.ReservedNumberList
    activity.operation = PAGE_OPERATION.ACTIVATE
    activity.resp_org = req.ro
    activity.status = PROGRESSING_STATUS.IN_PROGRESS
    activity.sub_dt_tm = mna_req.sub_dt_tm
    activity.created_at = new Date().toISOString()
    activity.updated_at = new Date().toISOString()

    payload.cmd = "U"
    payload.newRespOrgId = req.ro
    payload.conName = req.contactName
    payload.conTel = req.contactNumber
    payload.tmplName = req.templateName
    payload.svcOrderNum = req.serviceOrder
    payload.effDtTm = req.effDtTm

    mna_req.total = req.numList.length
    total = req.numList.length
    payload.qty = 1

    mna_req = await this.mnaReqRepository.create(mna_req)
    if (!mna_req)
      throw new HttpErrors.BadRequest("Failed to create activity")

    activity.total = total
    activity.completed = completed
    activity.failed = failed
    activity.req_id = mna_req.id

    activity = await this.activityRepository.create(activity)
    if (!activity)
      throw new HttpErrors.BadRequest("Failed to create activity")

    this.messageQueueService.pushMNA(activity, mna_req)

    while (total > 0) {
      total --
      payload.num = req.numList[total]
      payload.destNums = [ { destNum: req.numList[total], numTermLine: req.numTermLine }]

      let response = await this.tfnRegistryApiService.createPointerRecord(req.ro, payload, profile)
      console.log("MNA", response)

      let result:any = await this.saveMNAResult(mna_req, payload.num, response, activity, profile)

      failed += result.code
      completed += payload.qty - result.code
      error_message = this.appendErrorMessage(error_message, result.message)

      activatedNumbers = activatedNumbers.concat(result.list)

      // save progress to nsr_req
      mna_req.completed = completed;
      mna_req.failed = failed;
      mna_req.status = PROGRESSING_STATUS.IN_PROGRESS
      mna_req.message = error_message
      mna_req.updated_at = new Date().toISOString()
      await this.mnaReqRepository.save(mna_req)

      activity.completed = completed
      activity.failed = failed
      activity.status = PROGRESSING_STATUS.IN_PROGRESS
      activity.message = error_message
      activity.updated_at = new Date().toISOString()
      await this.activityRepository.save(activity)

      this.messageQueueService.pushMNA(activity, mna_req)
      await DataUtils.sleep(10)
    }

    mna_req.status = PROGRESSING_STATUS.COMPLETED
    if (mna_req.total == mna_req.failed)
      mna_req.status = PROGRESSING_STATUS.FAILED
    else if (mna_req.total == mna_req.completed)
      mna_req.status = PROGRESSING_STATUS.SUCCESS
    mna_req.updated_at = new Date().toISOString()
    await this.mnaReqRepository.save(mna_req)

    activity.status = mna_req.status
    activity.updated_at = new Date().toISOString()
    await this.activityRepository.save(activity)

    this.messageQueueService.pushMNA(activity, mna_req)

    if (activatedNumbers.length>0) {
      // send numbers to secure382.com to route
      await this.secure382ApiService.sendNumbers(req.ro!, activatedNumbers)
    }

    return mna_req
  }

  private async saveMNAResult(mna_req: MnaReq, num: string, response: any, activity: Activity, profile: AuthorizedUserProfile): Promise<any> {
    let failed = 0, error_message = "";
    let list = []

    let mna_result = new MnaResult()
    mna_result.req_id = mna_req.id
    mna_result.sub_dt_tm = mna_req.sub_dt_tm
    mna_result.num = num
    // mna_result.status = item.status

    let effDtTm = ""
    if (response.effDtTm!=null)
      effDtTm = response.effDtTm

    if (effDtTm=="")
      effDtTm = mna_req.eff_dt_tm

    if (response.failReason!=null || response.errList!=null) {
      if (response.failReason!=null && response.failReason.length>0) {
        const error: any = response.failReason[0];
        mna_result.message = error.errMsg + " Code: " + error.errCode

      } else if (response.errList!=null && response.errList.length>0) {
        const error: any = response.errList[0];
        mna_result.message = error.errMsg + " Code: " + error.errCode

      } else
        mna_result.message = MESSAGES.INTERNAL_SERVER_ERROR

      mna_result.status = PROGRESSING_STATUS.FAILED

      failed++
      error_message = this.appendErrorMessage(error_message, mna_result.message)
    } else {
      mna_result.eff_dt_tm = effDtTm
      mna_result.status = NUMBER_STATUS.PENDING

      // TODO - check "NOW"
      if (mna_req.eff_dt_tm=="NOW")
        await this.saveNumber(profile, mna_result.num!,
            mna_result.status!,
            mna_result.sub_dt_tm!, mna_req.ro_id, mna_req.template_name, effDtTm)

      list.push(response.num)
    }

    mna_result.eff_dt_tm = effDtTm
    mna_result.updated_at = new Date().toISOString()
    await this.mnaResultRepository.create(mna_result)

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.PAD, TASK_ACTION.CREATE,
        mna_result.num, mna_result.sub_dt_tm!, mna_result.status!, mna_req.ro_id, mna_result.message, effDtTm, mna_req.template_name, mna_req.eff_dt_tm=="NOW")

    return { code: failed, message: error_message, list };
  }



  async executeScript(sr: ScriptResult, user: any, profile?: AuthorizedUserProfile) {
    const sub_dt_tm: string = new Date().toISOString()

    while (true) {
      const status = await this.scriptResultRepository.getProgress(sr.id)
      if (DataUtils.isFinished(status)) {
        sr.status = status
      }

      if (sr.status==PROGRESSING_STATUS.WAITING) {
        let content: any = ""
        try {
          content = await this.scriptResultRepository.getScriptSQL(sr.id)
          if (content=="") {
            sr.message = "No SQL Content"
            sr.status = PROGRESSING_STATUS.FAILED

          } else {
            // parse sql content
            let temp: any[] | undefined = undefined
            let isTemplate = false

            if (content.includes(SCRIPT_TYPE.TMPL_DIALNBR)) {
              temp = content.split(SCRIPT_TYPE.TMPL_DIALNBR)
              isTemplate = true
            }
            else if (content.includes(SCRIPT_TYPE.DIALNBR)) {
              if (content.includes(SCRIPT_TYPE.TFNREPT_DIALNBR))
                temp = content.split(SCRIPT_TYPE.TFNREPT_DIALNBR)
              else
                temp = content.split(SCRIPT_TYPE.DIALNBR)
            }

            if (temp==null || temp.length<2) {
              sr.message = "Wrong SQL Script"
              sr.status = PROGRESSING_STATUS.FAILED
            } else {
              sr.is_template = isTemplate
              sr.ro = temp[1].substring(1, 6)
              // update status
              sr.status = PROGRESSING_STATUS.UPLOADING
            }
          }
        } catch (err) {
          sr.message = err?.message + "Code: " + err?.code
          sr.status = PROGRESSING_STATUS.FAILED
        }
      }
      else if (sr.status==PROGRESSING_STATUS.UPLOADING) {
        const content = await this.scriptResultRepository.getScriptSQL(sr.id)
        // TODO: write content to file
        const filename = user.username + "_"
            + Math.random().toString(36).substring(2, 15)
            + Math.random().toString(36).substring(2, 15)

        try {
          fs.writeFileSync(SCRIPT_HOME + filename + ".sql", content)

          // TODO: upload sql content to ftp server
          const result = await this.ftpService.upload(user, filename+".sql")
          if (result.success) {
            sr.filename = filename
            sr.uploaded_at = new Date().toISOString()
            sr.status = PROGRESSING_STATUS.DOWNLOADING
          } else {
            sr.status = PROGRESSING_STATUS.FAILED
            sr.message = result.message
          }

        } catch (err) {
          sr.message = err?.message
          sr.status = PROGRESSING_STATUS.FAILED
        }
      }
      else if (sr.status==PROGRESSING_STATUS.DOWNLOADING) {
        // TODO: download file from ftp server
        const time_passed = new Date().getTime() - Date.parse(sr.uploaded_at!)
        if (time_passed>60*1000) {
          sr.status = PROGRESSING_STATUS.FAILED
          sr.message = "Error occurred in FTP server"
        } else {
          const result = await this.ftpService.list(user, sr.filename!)
          if (result.success) {
            for (let item of result.list) {
              if (item.name.includes(sr.filename) && (item.name.endsWith(".out") || item.name.endsWith(".err"))) {
                if (item.name.endsWith(".out"))
                  sr.out_filename = item.name
                if (item.name.endsWith(".err"))
                  sr.err_filename = item.name
              }
            }

            if (sr.out_filename || sr.err_filename) {
              sr.status = PROGRESSING_STATUS.IMPORTING

              // TODO: read all content from downloaded file or read several lines on next step
              if (sr.out_filename) {
                const result = await this.ftpService.download(user, sr.out_filename!)
                sr.message = result.message
              }

              if (sr.err_filename) {
                const result = await this.ftpService.download(user, sr.err_filename!)
                sr.message = result.message
              }
            }
          } else {
            sr.status = PROGRESSING_STATUS.FAILED
            sr.message = result.message
          }
        }
      }
      else if (sr.status==PROGRESSING_STATUS.IMPORTING) {
        // check downloaded file
        try {
          if (sr.out_filename && fs.existsSync(SCRIPT_HOME + sr.out_filename)) {
            // TODO: update number list from downloaded file

            let skip = 0
            const buffer = fs.readFileSync(SCRIPT_HOME + sr.out_filename)
            let content = buffer.toString()
            if (content!="") {
              // TODO - parse content
              let blockList
              if (sr.is_template)
                blockList = content.split("TEMPLATENAME")
              else
                blockList = content.split("EN ORG")

              let results: any[] = [];

              if(blockList.length > 1) {
                blockList.forEach(block=>{
                  let rowList = block.split("\n")

                  if (rowList.length > 3) {
                    for(let i=2; i <= rowList.length - 2; i++) {
                      if (sr.is_template) {
                        if(!Boolean(rowList[i]) || rowList[i][0] != '*') break
                      } else {
                        if(!Boolean(rowList[i]) || !(rowList[i][0] != ' ' && rowList[i][1] != ' ' && rowList[i][2] == ' ')) break
                      }

                      var line: string = rowList[i].replace("\t", " ").replace("\t", " ")

                      while (line.includes("  "))
                        line = line.replace("  ", " ")

                      let itemList = line.split(" ")

                      if (itemList.length != 4) continue
                      if (sr.is_template) {
                        if (itemList[3]!="A") {
                          skip++
                          continue
                        }
                      }

                      let status = NUMBER_STATUS.SPARE
                      if (itemList[3]=="A") {
                        status = NUMBER_STATUS.ASSIGNED
                        if (sr.is_template) {
                          status = NUMBER_STATUS.WORKING
                        }
                      }
                      else if (itemList[3]=='P')
                        status = NUMBER_STATUS.SUSPEND
                      else if (itemList[3]=='D')
                        status = NUMBER_STATUS.DISCONNECT
                      else if (itemList[3]=='R')
                        status = NUMBER_STATUS.RESERVED
                      else if (itemList[3]=='T')
                        status = NUMBER_STATUS.TRANSITIONAL
                      else if (itemList[3]=='U')
                        status = NUMBER_STATUS.UNAVAILABLE
                      else if (itemList[3]=='W')
                        status = NUMBER_STATUS.WORKING
                      // else if (itemList[3]=='O')
                      //   status = NUMBER_STATUS.WORKING
                      // else if (itemList[3]=='F')
                      //   status = NUMBER_STATUS.WORKING

                      if (sr.is_template)
                        results.push({roId: itemList[2], number: itemList[1], status, template: itemList[0]});
                      else
                        results.push({roId: itemList[0] + itemList[1], number: itemList[2], status});
                    }
                  }
                });
              }

              for (let item of results) {
                if (item.number==null || item.number=="")
                  continue

                this.saveNumber(profile, item.number, item.status, sub_dt_tm, item.roId, item.template)

                sr.imported += 1
                if(sr.imported%10==0) {
                  this.messageQueueService.pushScriptExecution(sr)
                  await DataUtils.sleep(50)
                }
              }

              await DataUtils.sleep(50)
              this.messageQueueService.pushScriptExecution(sr)
            }

            // TODO: if read all, update status to "COMPLETED"
            sr.status = PROGRESSING_STATUS.COMPLETED
            sr.message = "Success"
            if (skip>0) {
              // sr.message += ". but skipped " + skip + " records for status"
            }
          }
        } catch (err) {
          sr.message = err?.message
          sr.status = PROGRESSING_STATUS.FAILED
        }

        try {
          if (sr.err_filename && fs.existsSync(SCRIPT_HOME + sr.err_filename)) {
            // TODO: update error from downloaded file
            const buffer = fs.readFileSync(SCRIPT_HOME + sr.err_filename)
            sr.message = buffer.toString()
          }
        } catch (err) {
          sr.message = err?.message
          sr.status = PROGRESSING_STATUS.FAILED
        }

        if (sr.status != PROGRESSING_STATUS.COMPLETED)
          sr.status = PROGRESSING_STATUS.FAILED
      }

      sr.updated_at = new Date().toISOString()
      await this.scriptResultRepository.save(sr)

      this.messageQueueService.pushScriptExecution(sr)

      await DataUtils.sleep(10)

      if (DataUtils.isFinished(sr.status)) {
        // TODO - delete all files
        try {
          if (sr.filename)
            fs.rm(SCRIPT_HOME + sr.filename + ".sql", ()=>{})
        } catch (err) {}

        try {
          if (sr.out_filename)
            fs.rm(SCRIPT_HOME + sr.out_filename, ()=>{})
        } catch (err) {}

        try {
          if (sr.err_filename)
            fs.rm(SCRIPT_HOME + sr.err_filename, ()=>{})
        } catch (err) {}
        return
      }
    }
  }

}
