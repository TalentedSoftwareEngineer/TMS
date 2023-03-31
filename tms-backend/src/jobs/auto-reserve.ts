import {cronJob, CronJob} from "@loopback/cron";
import {repository} from "@loopback/repository";
import {
    NarReqRepository,
    NarResultRepository,
    NumbersRepository,
    SomosUserRepository,
    UserRepository
} from "../repositories";
import {
    NSR_SUBMIT_TYPE,
    NSR_TYPE,
    NUMBER_STATUS,
    PROGRESSING_STATUS, TASK_ACTION,
    TASK_TYPE
} from "../constants/number_adminstration";
import {NarReq, NarResult, Numbers} from "../models";
import {service} from "@loopback/core";
import {MessageQueueService, TfnRegistryApiService} from "../services";
import {MESSAGES} from "../constants/messages";
import DataUtils from "../utils/data";

@cronJob()
export class AutoReserve extends CronJob {
    constructor(
        @repository(NarReqRepository)
        public narReqRepository: NarReqRepository,
        @repository(NarResultRepository)
        public narResultRepository: NarResultRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(NumbersRepository)
        public numbersRepository: NumbersRepository,
        @service(TfnRegistryApiService)
        public tfnRegistryApiService: TfnRegistryApiService,
        @service(MessageQueueService)
        public messageQueueService: MessageQueueService,
    ) {
        super({
            name: 'auto-reserve',
            onTick: async () => {
                await this.process()
            },
            cronTime: '*/5 * * * * *',
            start: false,
        });
    }

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

    private async finish(req: NarReq)  {
        if (req.total>0 && req.total == req.completed)
            req.status = PROGRESSING_STATUS.SUCCESS
        else if (req.completed > 0)
            req.status = PROGRESSING_STATUS.COMPLETED
        else
            req.status = PROGRESSING_STATUS.FAILED
        req.updated_at = new Date().toISOString()

        await this.narReqRepository.save(req)

        this.messageQueueService.pushNAR(req)
    }

    private async getAuthorizedProfile(user_id: number): Promise<any> {
        const user = await this.userRepository.findById(user_id)
        if (!user)
            return null

        const somos = await this.userRepository.somosUser(user.somos_id)
        if (!somos)
            return null

        return { user, somos }
    }

    private async send(req: NarReq) {
        const profile = await this.getAuthorizedProfile(req.user_id)
        if (profile==null) {
            req.message = "SOMOS User is empty"
            await this.finish(req)
            return
        }

        let payload: any = {
            conName: req.contact_name,
            conTel: req.contact_number,
        }

        let response: any = null;
        let type = NSR_TYPE.RANDOM
        const num = req.wild_card_num
        if (num.includes("*") || num.includes("&")) {
            // wild card reserve
            type = NSR_TYPE.WILDCARD
            payload.wildCardNum = num.replace(/-/g, "")
            payload.qty = 1

            response = await this.tfnRegistryApiService.searchAndReserveWildcardNumbers(req.ro_id, payload, profile)
        } else {
            // specific reserve
            // TODO - consider limit per request
            type = NSR_TYPE.SPECIFIC
            payload.numList = num.replace(/-/g, "").split(",")
            console.log("-------------", payload.numList)
            payload.qty = payload.numList.length
            payload.withVanity = "N"

            response = await this.tfnRegistryApiService.searchAndReserveSpecificNumbers(req.ro_id, payload, profile)
        }

        console.log("AutoReserve", response)
        let apiResult = null

        if (response==null) {
            req.failed += 1 // payload.qty
            req.message = this.appendErrorMessage(req.message!, MESSAGES.EMPTY_RESPONSE)
        }
        else if (response.errList!=null) {
            if (response.errList.length>0) {
                const error: any = response.errList[0];
                req.message = this.appendErrorMessage(req.message!, error.errMsg + " Code: " + error.errCode)
            } else
                req.message = this.appendErrorMessage(req.message!, MESSAGES.INTERNAL_SERVER_ERROR)

            req.failed += 1 // payload.qty
        }
        else if (response.code!=null && response.message!=null) {
            req.failed += 1 // payload.qty

            req.message = this.appendErrorMessage(req.message!, response.message + (response.code!="" ? " Code: " + response.code : ""))
        }
        else if (response.reqId!=null) {
            let reqId = response.reqId

            response = null
            while (response==null || response.numList==null) {
                await DataUtils.sleep(100)

                if (type == NSR_TYPE.WILDCARD)
                    response = await this.tfnRegistryApiService.retrieveSearchAndReserveWildcardNumbers(req.ro_id, reqId, profile)

                if (type == NSR_TYPE.SPECIFIC)
                    response = await this.tfnRegistryApiService.retrieveSearchAndReserveSpecificNumbers(req.ro_id, reqId, profile)

                console.log("AutoReserve Req", response)
            }

            apiResult = response

        } else if (response.blkId!=null) {
            req.failed += 1 // payload.qty
            req.message = this.appendErrorMessage(req.message!, "Request is in progress. " + "blkId: " + response.blkId)

        } else if (response.numList!=null) {
            apiResult = response

        } else {
            req.failed += 1
            req.message = this.appendErrorMessage(req.message!, MESSAGES.INTERNAL_SERVER_ERROR)
        }

        if (apiResult!=null) {
            let result = await this.saveResult(req, apiResult)
            // console.log("AutoReserve Result", result)

            req.completed += 1
            req.message = this.appendErrorMessage(req.message!, result.message)
        }

        req.total += 1
        req.status = PROGRESSING_STATUS.IN_PROGRESS
        req.updated_at = new Date().toISOString()
        await this.narReqRepository.save(req)

        this.messageQueueService.pushNAR(req)
    }

    private async saveResult(req: NarReq, response: any): Promise<any> {
        let failed = 0, error_message = "";

        for (const item of response.numList) {
            let nar_result = new NarResult()
            nar_result.req_id = req.id
            nar_result.sub_dt_tm = req.sub_dt_tm
            nar_result.num = item
            nar_result.status = NUMBER_STATUS.RESERVED

            // if (response.suggestdNumList!=null && response.suggestdNumList.length>index) {
            //     if (response.suggestdNumList[index]!=null && response.suggestdNumList[index].sggestedNum!=null) {
            //         nar_result.suggested_num = response.suggestdNumList[index].sggestedNum
            //         nar_result.message = MESSAGES.HAVE_SUGGESTED_NUMBER
            //     }
            // }

            nar_result.updated_at = new Date().toISOString()
            await this.narResultRepository.create(nar_result)

            await this.saveNumber(req.user_id, item, NUMBER_STATUS.RESERVED, req.sub_dt_tm!, req.ro_id)
        }

        return { code: failed, message: error_message };
    }

    private async saveNumber(user_id: number, num: string, status: string, sub_dt_tm: string, resp_org?: string) {
        let created_by = user_id
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
        numObj.updated_by = user_id

        await this.numbersRepository.create(numObj)
    }

    private async process() {
        const requests = await this.narReqRepository.find({where: {or: [{ status: PROGRESSING_STATUS.PENDING }, { status: PROGRESSING_STATUS.IN_PROGRESS }]}})
        requests.forEach(req => {
            const now = new Date().toISOString()
            if (now >= req.end_at) {
                this.finish(req)
            }
            else if (req.total>=req.max_request) {
                this.finish(req)
            }
            else if (now>=req.start_at) {
                this.send(req)
            }
        })
    }
}


