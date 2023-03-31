import {injectable, /* inject, */ BindingScope, service} from '@loopback/core';
import {TfnRegistryApiService} from "./tfn-registry-api.service";
import {HttpErrors} from "@loopback/rest";
import {MESSAGES} from "../constants/messages";
import DataUtils from "../utils/data";
import {Activity, ActivityResult, AuthorizedUserProfile, Notify, Template, TemplateRequest} from "../models";
import {PAGES} from "../constants/pages";
import {
  ADMIN_DATA_OPERATION,
  NUMBER_STATUS,
  PAGE_OPERATION,
  PROGRESSING_STATUS,
  TASK_ACTION, TASK_STATUS,
  TASK_TYPE
} from "../constants/number_adminstration";
import {repository} from "@loopback/repository";
import {ActivityRepository, ActivityResultRepository, NumbersRepository, TemplateRepository} from "../repositories";
import messages from "redis-smq/dist/src/config/messages/messages";
import {MessageQueueService} from "./message-queue.service";

@injectable({scope: BindingScope.TRANSIENT})
export class TemplateService {
  constructor(
      @repository(TemplateRepository)
      public templateRepository: TemplateRepository,
      @repository(NumbersRepository)
      public numbersRepository: NumbersRepository,
      @repository(ActivityRepository)
      public activityRepository: ActivityRepository,
      @repository(ActivityResultRepository)
      public activityResultRepository: ActivityResultRepository,
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

  public async save(profile: AuthorizedUserProfile, tmpl: any) {
    let isNew = false
    let template = await this.templateRepository.findOne({where: {name: tmpl.tmplName}})
    if (template) {

    } else {
      template = new Template()
      template.name = tmpl.tmplName
      template.created_at = new Date().toISOString()
      template.created_by = profile.user.id!

      isNew = true
    }

    if (tmpl.respOrg && tmpl.respOrg!="")
      template.resp_org = tmpl.respOrg

    if (tmpl.effDtTm && tmpl.effDtTm!="")
      template.eff_dt_tm = tmpl.effDtTm

    if (tmpl.description && tmpl.description!="")
      template.description = tmpl.description

    if (tmpl.custRecStat && tmpl.custRecStat!="")
      template.status = tmpl.custRecStat

    if (tmpl.apprStat && tmpl.apprStat!="")
      template.approval = tmpl.apprStat

    if (tmpl.custRecCompPart && tmpl.custRecCompPart!="")
      template.component = tmpl.custRecCompPart

    if (tmpl.recVersionId && tmpl.recVersionId!="")
      template.rec_version_id = tmpl.recVersionId
    else if (tmpl.rec_version_id && tmpl.rec_version_id!="")
      template.rec_version_id = tmpl.rec_version_id

    if (tmpl.tmplId && tmpl.tmplId!="")
      template.tmpl_id = tmpl.tmplId

    if (tmpl.tmplDesc && tmpl.tmplDesc!="")
      template.tmpl_desc = tmpl.tmplDesc
    if (tmpl.tmplRecStat && tmpl.tmplRecStat!="")
      template.tmpl_rec_stat = tmpl.tmplRecStat
    if (tmpl.lstEffDtTms)
      template.lst_eff_dt_tms = JSON.stringify(tmpl.lstEffDtTms)

    if (tmpl.reqEffDtTm && tmpl.reqEffDtTm!="")
      template.req_eff_dt_tm = tmpl.reqEffDtTm
    if (tmpl.reqTmplRecStat && tmpl.reqTmplRecStat!="")
      template.req_tmpl_rec_stat = tmpl.reqTmplRecStat

    if (tmpl.ctrlRespOrgId && tmpl.ctrlRespOrgId!="")
      template.resp_org = tmpl.ctrlRespOrgId
    if (tmpl.priority && tmpl.priority!="")
      template.priority = tmpl.priority
    if (tmpl.perms && tmpl.perms!="")
      template.perms = tmpl.perms
    if (tmpl.prevUsr && tmpl.prevUsr!="")
      template.prev_usr = tmpl.prevUsr
    if (tmpl.lastUpDt && tmpl.lastUpDt!="")
      template.last_up_dt = tmpl.lastUpDt
    if (tmpl.lastUsr && tmpl.lastUsr!="")
      template.last_usr = tmpl.lastUsr

    if (tmpl.conName && tmpl.conName!="")
      template.con_name = tmpl.conName
    if (tmpl.conTel && tmpl.conTel!="")
      template.con_tel = tmpl.conTel
    if (tmpl.notes && tmpl.notes!="")
      template.notes = tmpl.notes

    if (tmpl.interLATACarrier)
      template.inter_lata_carrier = JSON.stringify(tmpl.interLATACarrier)
    if (tmpl.intraLATACarrier)
      template.intra_lata_carrier = JSON.stringify(tmpl.intraLATACarrier)
    if (tmpl.aos)
      template.aos = JSON.stringify(tmpl.aos)

    if (tmpl.numTermLine)
      template.num_term_line = tmpl.numTermLine
    if (tmpl.cprSectName)
      template.cpr_sect_name = JSON.stringify(tmpl.cprSectName)
    if (tmpl.dayLightSavings && tmpl.dayLightSavings!="")
      template.day_light_savings = tmpl.dayLightSavings

    if (tmpl.priInterLT && tmpl.priInterLT!="")
      template.pri_inter_lt = tmpl.priInterLT
    if (tmpl.priIntraLT && tmpl.priIntraLT!="")
      template.pri_intra_lt = tmpl.priIntraLT

    if (tmpl.tmZn && tmpl.tmZn!="")
      template.tm_zn = tmpl.tmZn

    if (tmpl.lbl)
      template.lbl = JSON.stringify(tmpl.lbl)

    template.updated_at = new Date().toISOString()
    template.updated_by = profile.user.id!

    template = isNew ? await this.templateRepository.create(template) : await this.templateRepository.save(template)
    return template
  }

  async getList(ro: string, profile: AuthorizedUserProfile, startTemplateName?: string) {
    let entity = ro.substring(0, 2)
    if (startTemplateName!=null && startTemplateName.length>3)
      entity = startTemplateName.substring(1,3)

    let response = await this.tfnRegistryApiService.listTemplateRecords(ro, entity, profile, startTemplateName)
    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length > 0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)

    } else if (response.code!=null && response.message!=null) {
      throw new HttpErrors.BadRequest(response.message + (response.code!="" ? " Code: " + response.code : ""))

    } else if (response.reqId!=null) {
      let reqId = response.reqId
      while (response==null || response.tmplList==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.listTemplateRecordsByReqId(ro, reqId, profile)
      }

      return response.tmplList
    } else if (response.tmplList!=null)
      return response.tmplList;

    throw new HttpErrors.InternalServerError
  }

  async getInformation(ro: string, tmplName: string, effDtTm: string, profile: AuthorizedUserProfile, isAct: boolean) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    let response = await this.tfnRegistryApiService.queryTemplateRecord(ro, tmplName, profile, effDtTm)
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
      while (response==null || response.lstEffDtTms==null) {
        await DataUtils.sleep(100)
        response = await this.tfnRegistryApiService.queryTemplateRecordByReqId(ro, reqId, profile)
      }

      result = response.lstEffDtTms
    } else if (response.lstEffDtTms!=null) {
      result = response.lstEffDtTms;

    } else {
      message = MESSAGES.INTERNAL_SERVER_ERROR
    }

    // save activity, task or not
    if (isAct===true) {
      const activity = await this.createActivity(profile,
          isAct===true ? PAGES.TemplateAdminData : PAGES.TemplateRecordList, PAGE_OPERATION.RETRIEVE, sub_dt_tm,
          1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)
      this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.RETRIEVE, "", sub_dt_tm, activity.status, undefined, message, effDtTm, tmplName)
    }

    if (result==null) {
      if (isAct)
        throw new HttpErrors.BadRequest(message)
      return null
    }

    return response
  }

  async retrieve(ro: string, tmplName: string, effDtTm: string, profile: AuthorizedUserProfile, isAct: boolean) {
    const current_utc_time = new Date().toISOString()
    let eff_dt_tm = effDtTm
    let response: any = await this.getInformation(ro, tmplName, effDtTm, profile, isAct)
    if (!isAct && response==null)
      return null
    let rec_version_id = response.recVersionId
    if (!isAct)
      await this.save(profile, { ...response, tmplName })

    response.lstEffDtTms.forEach((item: any) => {
      if (item.effDtTm < current_utc_time)
        eff_dt_tm = item.effDtTm
    })

    // check template table with name and eff_dt_tm
    const tmpl = await this.templateRepository.findOne({where: {and: [ {name: tmplName}, {eff_dt_tm: eff_dt_tm} ]}})
    if (tmpl) {
      // TODO - if exist, make template record from database.
      response = {
        tmplId: tmpl.tmpl_id,
        tmplDesc: tmpl.tmpl_desc,
        tmplRecStat: tmpl.tmpl_rec_stat,
        effDtTm: tmpl.eff_dt_tm,

        recVersionId: tmpl.rec_version_id,
        custRecStat: tmpl.status,
        apprStat: tmpl.approval,
        custRecCompPart: tmpl.component,

        reqEffDtTm: tmpl.req_eff_dt_tm,
        reqTmplRecStat: tmpl.req_tmpl_rec_stat,

        ctrlRespOrgId: tmpl.resp_org,
        priority: tmpl.priority,
        perms: tmpl.perms,
        prevUsr: tmpl.prev_usr,
        lastUpDt: tmpl.last_up_dt,
        lastUsr: tmpl.last_usr,

        conName: tmpl.con_name,
        conTel: tmpl.con_tel,
        notes: tmpl.notes,

        numTermLine: tmpl.num_term_line,
        dayLightSavings: tmpl.day_light_savings,
        priInterLT: tmpl.pri_inter_lt,
        priIntraLT: tmpl.pri_intra_lt,

        tmZn: tmpl.tm_zn,
      }

      try {
        if (tmpl.lst_eff_dt_tms!="")
          response.lstEffDtTms = JSON.parse(tmpl.lst_eff_dt_tms!)
      } catch (err) {}

      try {
        if (tmpl.inter_lata_carrier!="")
          response.interLATACarrier = JSON.parse(tmpl.inter_lata_carrier!)
      } catch (err) {}

      try {
        if (tmpl.intra_lata_carrier!="")
          response.intraLATACarrier = JSON.parse(tmpl.intra_lata_carrier!)
      } catch (err) {}

      try {
        if (tmpl.aos!="")
          response.aos = JSON.parse(tmpl.aos!)
      } catch (err) {}

      try {
        if (tmpl.cpr_sect_name!="")
          response.cprSectName = JSON.parse(tmpl.cpr_sect_name!)
      } catch (err) {}

      try {
        if (tmpl.lbl!="")
          response.lbl = JSON.parse(tmpl.lbl!)
      } catch (err) {}

    }
    else {
      let message = ""
      response = await this.tfnRegistryApiService.retrieveTemplateRecord(ro, tmplName, profile, eff_dt_tm)
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
          const activity = await this.createActivity(profile, PAGES.TemplateAdminData, PAGE_OPERATION.RETRIEVE, current_utc_time,
              1, 0, PROGRESSING_STATUS.FAILED)
          this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.RETRIEVE, "", current_utc_time, activity.status, undefined, message, eff_dt_tm, tmplName)

          if (message.includes("540001"))
            return { isNew: true }

          throw new HttpErrors.BadRequest(message)
        }

        return null
      }
    }

    // save response to database
    const updatedTemplate = await this.save(profile, { ...response, rec_version_id, tmplName })

    // add working numbers to response
    if (isAct) {
      const numbers = await this.numbersRepository.find({where: {and: [ {template_name: tmplName}, {status: NUMBER_STATUS.WORKING} ]}})
      response.numbers = numbers.map((item)=> { return item.num })

      // save activity, task
      const activity = await this.createActivity(profile, PAGES.TemplateAdminData, PAGE_OPERATION.RETRIEVE, current_utc_time,
          1, 1, PROGRESSING_STATUS.SUCCESS)
      this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.RETRIEVE, "", current_utc_time, activity.status, response.ctrlRespOrgId, undefined, response.effDtTm, tmplName)
    }

    if (isAct)
      return response

    return updatedTemplate
  }

  async lock(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    let response = await this.tfnRegistryApiService.lockTemplateRecord(ro, body, profile)
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
        response = await this.tfnRegistryApiService.lockTemplateRecordByReqId(ro, reqId, profile)
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

    let response = await this.tfnRegistryApiService.unlockTemplateRecord(ro, body, profile)
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
        response = await this.tfnRegistryApiService.unlockTemplateRecordByReqId(ro, reqId, profile)
      }

      result = response
    } else {
      result = response
    }

    if (result==null)
      return {success: false, message}
      // throw new HttpErrors.BadRequest(message)

    return response
  }

  async copy(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.TemplateAdminData
    notify.operation = PAGE_OPERATION.COPY
    notify.completed = false
    notify.title = "Template: <b>" + body.srcTmplName + "</b> COPY --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushTAD(notify)

    // get srcRecVersionId from source template
    const srcTmpl = await this.templateRepository.findOne({where: {name: body.srcTmplName}})
    if (srcTmpl)
      body.srcRecVersionId = srcTmpl.rec_version_id

    let response = await this.tfnRegistryApiService.copyTemplateRecord(ro, body, profile)
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
        response = await this.tfnRegistryApiService.copyTemplateRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.TemplateAdminData, PAGE_OPERATION.COPY, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.COPY, "", sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
          body.srcNum, body.srcEffDtTm, body.srcTmplName)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushTAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.COPY, "", sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
        undefined, body.srcEffDtTm, body.srcTmplName)

    notify.message = "Saving Template ..."
    this.messageQueueService.pushTAD(notify)

    // TODO - process error message
    const template = await this.retrieve(ro, body.tgtTmplName, result, profile, false)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"

    if (template==null)
      notify.message += "  But Error in Saving Template."
    else {
      notify.result = template
    }

    this.messageQueueService.pushTAD(notify)

    return response
  }

  async transfer(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.TemplateAdminData
    notify.operation = PAGE_OPERATION.TRANSFER
    notify.completed = false
    notify.title = "Template: <b>" + body.srcTmplName + "</b> TRANSFER --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushTAD(notify)

    // get srcRecVersionId from source template
    const srcTmpl = await this.templateRepository.findOne({where: {name: body.srcTmplName}})
    if (srcTmpl)
      body.srcRecVersionId = srcTmpl.rec_version_id

    let response = await this.tfnRegistryApiService.transferTemplateRecord(ro, body, profile)
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
        response = await this.tfnRegistryApiService.transferTemplateRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    } else
      message = MESSAGES.INTERNAL_SERVER_ERROR

    const activity = await this.createActivity(profile, PAGES.TemplateAdminData, PAGE_OPERATION.TRANSFER, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.TRANSFER, "", sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
          body.srcNum, body.srcEffDtTm, body.srcTmplName)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushTAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    // delete source template
    try {
      if (body.tmplRecCompPart!=null && body.tmplRecCompPart.includes("TAD"))
        await this.templateRepository.deleteById(srcTmpl?.id!)
    } catch (err) {
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.TRANSFER, "", sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
        body.srcNum, body.srcEffDtTm, body.srcTmplName)

    notify.message = "Saving Template ..."
    this.messageQueueService.pushTAD(notify)

    // TODO - process error message
    const template = await this.retrieve(ro, body.tgtTmplName, result, profile, false)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"

    if (template==null)
      notify.message += "  But Error in Saving Template."
    else {
      notify.result = template
    }

    this.messageQueueService.pushTAD(notify)

    return response
  }

  async disconnect(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.TemplateAdminData
    notify.operation = PAGE_OPERATION.DISCONNECT
    notify.completed = false
    notify.title = "Template: <b>" + body.srcTmplName + "</b> DISCONNECT --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushTAD(notify)

    // get srcRecVersionId from source template
    const srcTmpl = await this.templateRepository.findOne({where: {name: body.srcTmplName}})
    if (srcTmpl)
      body.srcRecVersionId = srcTmpl.rec_version_id

    let response = await this.tfnRegistryApiService.disconnectTemplateRecord(ro, body, profile)
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
        response = await this.tfnRegistryApiService.disconnectTemplateRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.TemplateAdminData, PAGE_OPERATION.DISCONNECT, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.DISCONNECT, "", sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
          body.srcNum, body.srcEffDtTm, body.srcTmplName)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushTAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.DISCONNECT, "", sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
        body.srcNum, body.srcEffDtTm, body.srcTmplName)

    notify.message = "Saving Template ..."
    this.messageQueueService.pushTAD(notify)

    // TODO - process error message
    const template = await this.retrieve(ro, body.tgtTmplName, result, profile, false)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"

    if (template==null)
      notify.message += "  But Error in Saving Template."
    else {
      notify.result = template
    }

    this.messageQueueService.pushTAD(notify)

    return response
  }

  async create(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.TemplateAdminData
    notify.operation = PAGE_OPERATION.CREATE
    notify.completed = false
    notify.title = "Template: <b>" + body.srcTmplName + "</b> CREATE --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushTAD(notify)

    // get srcRecVersionId from source template
    const srcTmpl = await this.templateRepository.findOne({where: {name: body.srcTmplName}})
    if (srcTmpl)
      body.srcRecVersionId = srcTmpl.rec_version_id

    let response = await this.tfnRegistryApiService.createTemplateRecord(ro, body, profile)
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
        response = await this.tfnRegistryApiService.retrieveTemplateRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.TemplateAdminData, PAGE_OPERATION.CREATE, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.CREATE, "", sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
          body.srcNum, body.srcEffDtTm, body.srcTmplName)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushTAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.CREATE, "", sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
        body.srcNum, body.srcEffDtTm, body.srcTmplName)

    notify.message = "Saving Template ..."
    this.messageQueueService.pushTAD(notify)

    // TODO - process error message
    const template = await this.retrieve(ro, body.tgtTmplName, result, profile, false)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"

    if (template==null)
      notify.message += "  But Error in Saving Template."
    else {
      notify.result = template
    }

    this.messageQueueService.pushTAD(notify)

    return response
  }

  async update(ro: string, body: any, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.TemplateAdminData
    notify.operation = PAGE_OPERATION.UPDATE
    notify.completed = false
    notify.title = "Template: <b>" + body.srcTmplName + "</b> UPDATE --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushTAD(notify)

    // get srcRecVersionId from source template
    const srcTmpl = await this.templateRepository.findOne({where: {name: body.srcTmplName}})
    if (srcTmpl)
      body.srcRecVersionId = srcTmpl.rec_version_id

    let response = await this.tfnRegistryApiService.updateTemplateRecord(ro, body, profile)
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
        response = await this.tfnRegistryApiService.retrieveTemplateRecordByReqId(ro, reqId, profile)
      }

      result = response.effDtTm
    } else if (response.effDtTm!=null) {
      result = response.effDtTm
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.TemplateAdminData, PAGE_OPERATION.UPDATE, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.UPDATE, "", sub_dt_tm, activity.status,
          body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
          body.srcNum, body.srcEffDtTm, body.srcTmplName)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushTAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.UPDATE, "", sub_dt_tm, body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? TASK_STATUS.PENDING : TASK_STATUS.SAVED,
        body.ctrlRespOrgId, message, body.tgtEffDtTm, body.tgtTmplName, undefined,
        body.srcNum, body.srcEffDtTm, body.srcTmplName)

    notify.message = "Saving Template ..."
    this.messageQueueService.pushTAD(notify)

    // TODO - process error message
    const template = await this.retrieve(ro, body.tgtTmplName, result, profile, false)

    notify.completed = true
    notify.result = response
    notify.message = body.cmd==ADMIN_DATA_OPERATION.SUBMIT ? "Successfully submitted and Now it is pending..." : "Successfully saved!"

    if (template==null)
      notify.message += "  But Error in Saving Template."
    else {
      notify.result = template
    }

    this.messageQueueService.pushTAD(notify)

    return null
  }

  async delete(ro: string, tmplName: string, effDtTm: string, profile: AuthorizedUserProfile) {
    const sub_dt_tm = new Date().toISOString()
    let message = ""
    let result: any = null
    let recVersionId = ""

    const notify = new Notify()
    notify.user_id = profile.user.id!
    notify.page = PAGES.TemplateAdminData
    notify.operation = PAGE_OPERATION.DELETE
    notify.completed = false
    notify.title = "Template: <b>" + tmplName + "</b> DELETE --> "
    notify.message =  "IN PROGRESS ....."
    this.messageQueueService.pushTAD(notify)

    // get srcRecVersionId from source template
    const srcTmpl = await this.templateRepository.findOne({where: {name: tmplName}})
    if (srcTmpl)
      recVersionId = srcTmpl.rec_version_id!

    let response = await this.tfnRegistryApiService.deleteTemplateRecord(ro, tmplName, effDtTm, recVersionId, profile)
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
      //   await DataUtils.sleep(100)
      //   response = await this.tfnRegistryApiService.disconnectTemplateRecordByReqId(ro, reqId, profile)
      // }

      message = "Request is in progress. ReqId: " + reqId
    } else  {
      result = response//.effDtTm
    }

    // save activity, task
    const activity = await this.createActivity(profile, PAGES.TemplateAdminData, PAGE_OPERATION.DELETE, sub_dt_tm,
        1, result==null ? 0 : 1, result==null ? PROGRESSING_STATUS.FAILED : PROGRESSING_STATUS.SUCCESS)

    if (result==null) {
      await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.DELETE, "", sub_dt_tm, activity.status,
          "", message, effDtTm, tmplName, undefined)

      notify.completed = true
      notify.message = message
      this.messageQueueService.pushTAD(notify)

      // throw new HttpErrors.BadRequest(message)
      return null
    }

    await this.saveActivityResult(profile, activity.id, TASK_TYPE.TAD, TASK_ACTION.DELETE, "", sub_dt_tm, TASK_STATUS.PENDING,
        "", message, effDtTm, tmplName, undefined)

    notify.message = "Deleting Template ..."
    this.messageQueueService.pushTAD(notify)

    await this.templateRepository.deleteById(srcTmpl?.id!)

    notify.completed = true
    notify.message = "Deleted successfully."
    notify.result = response
    this.messageQueueService.pushTAD(notify)

    return null
  }

}
