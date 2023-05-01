import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {Activity, ActivityResult, AuthorizedUserProfile, Notify, Numbers} from "../models";
import {MESSAGES} from "../constants/messages";
import DataUtils from "../utils/data";
import {PAGES} from "../constants/pages";
import {
  ADMIN_DATA_OPERATION,
  NUMBER_STATUS,
  PAGE_OPERATION,
  PROGRESSING_STATUS,
  TASK_ACTION, TASK_STATUS,
  TASK_TYPE
} from "../constants/number_adminstration";
import {HttpErrors} from "@loopback/rest";
import {TfnRegistryApiService} from "./tfn-registry-api.service";
import {repository} from "@loopback/repository";
import {ActivityRepository, ActivityResultRepository, NumbersRepository} from "../repositories";
import {MessageQueueService} from "./message-queue.service";

@injectable({scope: BindingScope.TRANSIENT})
export class CustomerRecordService {
  constructor(
      @repository(ActivityRepository)
      public activityRepository: ActivityRepository,
      @repository(ActivityResultRepository)
      public activityResultRepository: ActivityResultRepository,
      @repository(NumbersRepository)
      public numbersRepository: NumbersRepository,
      @service(TfnRegistryApiService)
      public tfnRegistryApiService: TfnRegistryApiService,
      @service(MessageQueueService)
      public messageQueueService: MessageQueueService,
  ) {}


  private async createActivity(profile: AuthorizedUserProfile, page: string, operation: string, sub_dt_tm: string,
                               total: number, completed: number, status: string, resp_org?: string) {
    let activity: Activity = new Activity()
    activity.user_id = profile.user.id!
    activity.page = page
    activity.operation = operation
    activity.sub_dt_tm = sub_dt_tm
    activity.created_at = sub_dt_tm
    activity.updated_at = new Date().toISOString()
    activity.total = total
    activity.completed = completed
    activity.failed = total - completed
    activity.status = status

    if (resp_org)
      activity.resp_org = resp_org

    return this.activityRepository.create(activity)
  }

  private async saveActivityResult(profile: AuthorizedUserProfile, activity_id: string, type: string, action: string,
                                   tgt_num: string, sub_dt_tm: string,
                                   status: string, resp_org?: string, message?: string, tgt_eff_dt_tm?: string, tgt_tmpl_name?: string,
                                   is_now?: boolean, src_num?: string, src_eff_dt_tm?: string, src_tmpl_name?: string) {
    const activityResult = new ActivityResult()

    activityResult.activity_id = activity_id
    activityResult.type = type
    activityResult.action = action

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

    if (src_num)
      activityResult.src_num = src_num

    if (src_eff_dt_tm)
      activityResult.src_eff_dt_tm = src_eff_dt_tm

    if (src_tmpl_name)
      activityResult.src_tmpl_name = src_tmpl_name

    if (is_now || (tgt_eff_dt_tm && tgt_eff_dt_tm=="NOW"))
      activityResult.is_now = is_now ? is_now : tgt_eff_dt_tm=="NOW"

    activityResult.user_id = profile.user.id!
    activityResult.updated_at = new Date().toISOString()

    await this.activityResultRepository.create(activityResult)
  }

  private async saveNumber(profile: AuthorizedUserProfile, num: string, status?: string, sub_dt_tm?: string, resp_org?: string,
                           template_name?: string, eff_dt_tm?: string, last_act_dt?: string, res_until_dt?: string, disc_until_dt?: string) {
    let created_by = profile.user.id
    let created_at = new Date().toISOString()

    let numObj: any = await this.numbersRepository.findOne({where: {num: num}})
    if (numObj) {
      if (numObj.status!=null && status==null) {
        status = numObj.status
      }

      if (numObj.sub_dt_tm!=null && sub_dt_tm==null) {
        sub_dt_tm = numObj.sub_dt_tm
      }

      if (numObj.resp_org!=null && resp_org==null) {
        resp_org = numObj.resp_org
      }

      if (numObj.template_name!=null && template_name==null) {
        template_name = numObj.template_name
      }

      created_by = numObj.created_by
      created_at = numObj.created_at

      await this.numbersRepository.deleteById(numObj.id)
      if (status==NUMBER_STATUS.SPARE)
        return
    }

    numObj = new Numbers()
    numObj.num = num
    numObj.user_id = profile.user.id

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

    numObj.created_at = created_at
    numObj.created_by = created_by
    numObj.updated_at = new Date().toISOString()
    numObj.updated_by = profile.user.id!

    await this.numbersRepository.create(numObj)
  }


  async retrieve(ro: string, num: string, effDtTm: string, profile: AuthorizedUserProfile, isAct: boolean) {
    const current_utc_time = new Date().toISOString()
    let eff_dt_tm = effDtTm

    let message = ""
    let response = await this.tfnRegistryApiService.retrieveCustomerRecord(ro, num, profile, eff_dt_tm)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.tmplId==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.retrieveTemplateRecordByReqId(ro, reqId, profile)
      }

    } else {
    }

    if (message.length > 0) {
      if (isAct) {
        // failed, save activity, task and throw exception
        const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.RETRIEVE, current_utc_time,
            1, 0, PROGRESSING_STATUS.FAILED)
        this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.RETRIEVE, num, current_utc_time, activity.status, undefined, message, eff_dt_tm)

        // new record
        // if (message.includes("540001"))
        //   return { isNew: true }

        // multiple entity
        // if (message.includes("505002") || message.includes("505004") || message.includes("530004"))
        return response
        // throw new HttpErrors.BadRequest(message)
      }

      return null
    }

    if (isAct) {
      const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.RETRIEVE, current_utc_time,
          1, 1, PROGRESSING_STATUS.SUCCESS)
      this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.RETRIEVE, num, current_utc_time, activity.status, response.ctrlRespOrgId, undefined, response.effDtTm)
    }

    return response
  }

  async lock(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    let response = await this.tfnRegistryApiService.lockCustomerRecord(ro, body, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.errList!=null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.lockCustomerRecordByReqId(ro, reqId, profile)
      }

      result = response
    } else {
      result = response
    }

    if (result==null)
      throw new HttpErrors.BadRequest(message)

    return response
  }

  async unlock(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    let response = await this.tfnRegistryApiService.unlockCustomerRecord(ro, body, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.errList!=null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.unlockCustomerRecordByReqId(ro, reqId, profile)
      }

      result = response
    } else {
      result = response
    }

    if (result==null)
      return { success: false, message}
      // throw new HttpErrors.BadRequest(message)

    return response
  }

  async copy(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.CustomerAdminData
    notify.operation = PAGE_OPERATION.COPY
    notify.completed = false
    notify.title = "Customer Record: <b>" + body.srcNum + "</b> COPY --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushCAD(notify)

    let response = await this.tfnRegistryApiService.copyCustomerRecord(ro, body, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.effDtTm==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.copyCustomerRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    } else
      message = MESSAGES.INTERNAL_SERVER_ERROR

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.COPY, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.COPY, body.tgtNum, sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
          body.srcNum, body.srcEffDtTm)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushCAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.COPY, body.tgtNum, sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, response.effDtTm, body.tgtTmplName, undefined,
        body.srcNum, body.srcEffDtTm)

    notify.completed = true
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"
    notify.result = response
    this.messageQueueService.pushCAD(notify)

    return response
  }

  async transfer(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.CustomerAdminData
    notify.operation = PAGE_OPERATION.TRANSFER
    notify.completed = false
    notify.title = "Customer Record : <b>" + body.srcNum + "</b> TRANSFER --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushCAD(notify)

    let response = await this.tfnRegistryApiService.transferCustomerRecord(ro, body, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.effDtTm==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.transferCustomerRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    } else
      message = MESSAGES.INTERNAL_SERVER_ERROR

    // TODO - save activity, task
    // var srcNum = ""
    // if (body.has("srcNum"))
    //   srcNum = body.getString("srcNum")

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.TRANSFER, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.TRANSFER, body.tgtNum, sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
          body.srcNum, body.srcEffDtTm)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushCAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.TRANSFER, body.tgtNum, sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, response.effDtTm, body.tgtTmplName, undefined,
        body.srcNum, body.srcEffDtTm)

    notify.completed = true
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"
    notify.result = response

    this.messageQueueService.pushCAD(notify)

    return response
  }

  async disconnect(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.CustomerAdminData
    notify.operation = PAGE_OPERATION.DISCONNECT
    notify.completed = false
    notify.title = "Customer Record: <b>" + body.srcNum + "</b> DISCONNECT --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushCAD(notify)

    let response = await this.tfnRegistryApiService.disconnectCustomerRecord(ro, body, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.effDtTm==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.disconnectCustomerRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    }

    const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.DISCONNECT, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.DISCONNECT, body.tgtNum, sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
          body.srcNum, body.srcEffDtTm)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushCAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.DISCONNECT, body.tgtNum, sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, response.effDtTm, body.tgtTmplName, undefined,
        body.srcNum, body.srcEffDtTm)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"
    this.messageQueueService.pushCAD(notify)

    return response
  }

  async create(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.CustomerAdminData
    notify.operation = PAGE_OPERATION.CREATE
    notify.completed = false
    notify.title = "Customer Record: <b>" + body.num + "</b> CREATE --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushCAD(notify)

    let response = await this.tfnRegistryApiService.createCustomerRecord(ro, body, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.effDtTm==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.retrieveCustomerRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.CREATE, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.CREATE, body.num, sub_dt_tm, activity.status,
          body.newRespOrgId, message, body.effDtTm, undefined, undefined)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushCAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.CREATE, body.num, sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.newRespOrgId, message, response.effDtTm, undefined, undefined)

    // save number
    this.saveNumber(profile, body.num, NUMBER_STATUS.ASSIGNED, sub_dt_tm, body.newRespOrgId, undefined, response.effDtTm)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"

    this.messageQueueService.pushCAD(notify)

    return response
  }

  async update(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.CustomerAdminData
    notify.operation = PAGE_OPERATION.UPDATE
    notify.completed = false
    notify.title = "Customer Record: <b>" + body.num + "</b> UPDATE --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushCAD(notify)

    let response = await this.tfnRegistryApiService.updateCustomerRecord(ro, body, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.effDtTm==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.retrieveCustomerRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.UPDATE, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.UPDATE, body.num, sub_dt_tm, activity.status,
          undefined, message, body.effDtTm, undefined, undefined)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushCAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.UPDATE, body.num, sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        undefined, message, body.effDtTm, undefined, undefined)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"

    this.messageQueueService.pushCAD(notify)

    return null
  }

  async delete(ro: string, num: string, effDtTm: string, recVersionId: string, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.CustomerAdminData
    notify.operation = PAGE_OPERATION.DELETE
    notify.completed = false
    notify.title = "Customer Record: <b>" + num + "</b> DELETE --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushCAD(notify)

    let response = await this.tfnRegistryApiService.deleteCustomerRecord(ro, num, effDtTm, recVersionId, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      // while (response==null || response.effDtTm==null) {
      //   await DataUtils.sleep(10)
      //   response = await this.tfnRegistryApiService.disconnectTemplateRecordByReqId(ro, reqId, profile)
      // }

      message = "Request is in progress. ReqId: " + reqId
    } else  {
      result = response//.effDtTm
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.DELETE, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.DELETE, num, sub_dt_tm, activity.status,
          "", message, effDtTm, undefined, undefined)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushCAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.DELETE, num, sub_dt_tm, TASK_STATUS.PENDING,
        "", message, response.effDtTm, undefined, undefined)

    notify.completed = true
    notify.message = "Deleted successfully."
    notify.result = response
    this.messageQueueService.pushCAD(notify)

    return null
  }

  async convert(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.CustomerAdminData
    notify.operation = PAGE_OPERATION.CONVERT
    notify.completed = false
    notify.title = "Customer Record: <b>" + body.num + "</b> CONVERT --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushCAD(notify)

    let response = await this.tfnRegistryApiService.convertCustomerRecordToPointerRecord(ro, body, profile)
    if (response==null) {
      message = MESSAGES.EMPTY_RESPONSE

    } else if (response.errList!=null) {
      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

    } else if (response.code!=null && response.message!=null) {
      message = response.message + (response.code!="" ? " Code: " + response.code : "")

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.effDtTm==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.convertCustomerRecordToPointerRecordByReqId(ro, reqId, profile)
      }

      result = response
    } else if (response.blkId!=null) {
      let blkId = response.blkId
      while (response==null || response.effDtTm==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.convertCustomerRecordToPointerRecordByBlkId(ro, blkId, profile)
      }

      result = response
    } else if (response.effDtTm!=null) {
      result = response
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.CustomerAdminData, PAGE_OPERATION.CONVERT, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.CONVERT, body.numList[0], sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.effDtTm, body.tmplName, undefined)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushCAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.CAD, TASK_ACTION.CONVERT, body.numList[0], sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, response.effDtTm, body.tmplName, undefined)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"

    this.messageQueueService.pushCAD(notify)

    return null
  }
}
