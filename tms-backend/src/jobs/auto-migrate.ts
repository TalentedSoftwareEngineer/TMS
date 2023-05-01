import {cronJob, CronJob} from "@loopback/cron";
import shellExec from 'shell-exec'
import {repository} from "@loopback/repository";
import {
    NarReqRepository,
    NarResultRepository,
    NumbersRepository, ScriptResultRepository,
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
import {TEMPORARY} from "../config";

@cronJob()
export class AutoMigrate extends CronJob {
    constructor(
        @repository(NumbersRepository) public numbersRepository: NumbersRepository,
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
    }

    private async removeSpareNumbers() {
        await this.numbersRepository.deleteAll({status: NUMBER_STATUS.SPARE})
    }

    private async removeTemporaryFiles() {
        await shellExec("sudo rm -rf " + TEMPORARY + "/*")
    }
}


