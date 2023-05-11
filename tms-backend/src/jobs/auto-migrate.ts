import {cronJob, CronJob} from "@loopback/cron";
import shellExec from 'shell-exec'
import {repository} from "@loopback/repository";
import {
    McpReqRepository, MnaReqRepository, MndReqRepository, MnqReqRepository, MnsReqRepository, MroReqRepository,
    NarReqRepository,
    NarResultRepository, NsrReqRepository,
    NumbersRepository, OcaReqRepository, ScriptResultRepository,
    SomosUserRepository, TrqReqRepository,
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
import {TEMPORARY} from "../config";

@cronJob()
export class AutoMigrate extends CronJob {
    constructor(
        @repository(NumbersRepository) public numbersRepository: NumbersRepository,
        @repository(McpReqRepository) public mcpReqRepository: McpReqRepository,
        @repository(MnaReqRepository) public mnaReqRepository: MnaReqRepository,
        @repository(MndReqRepository) public mndReqRepository: MndReqRepository,
        @repository(MnqReqRepository) public mnqReqRepository: MnqReqRepository,
        @repository(MnsReqRepository) public mnsReqRepository: MnsReqRepository,
        @repository(MroReqRepository) public mroReqRepository: MroReqRepository,
        @repository(NarReqRepository) public narReqRepository: NarReqRepository,
        @repository(NsrReqRepository) public nsrReqRepository: NsrReqRepository,
        @repository(OcaReqRepository) public ocaReqRepository: OcaReqRepository,
        @repository(TrqReqRepository) public trqReqRepository: TrqReqRepository,
    ) {
        super({
            name: 'auto-reserve',
            onTick: async () => {
                await this.process()
            },
            cronTime: '0 0 0 * * *',
            start: false,
        });
    }

    private async process() {
        console.log("Auto migrating.... " + new Date().toISOString())

        await this.removeSpareNumbers()
        await this.removeTemporaryFiles()
        await this.removeRequests()
    }

    private async removeSpareNumbers() {
        await this.numbersRepository.deleteAll({status: NUMBER_STATUS.SPARE})
    }

    private async removeTemporaryFiles() {
        await shellExec("sudo rm -rf " + TEMPORARY + "/*")
    }

    private async removeRequests() {
        const dt = new Date(new Date().getTime() - 1000*3600*24*30).toISOString()

        await this.mcpReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.mnaReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.mndReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.mnqReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.mnsReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.mroReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.narReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.nsrReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.ocaReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
        await this.trqReqRepository.deleteAll({sub_dt_tm: {lt: dt}})
    }
}


