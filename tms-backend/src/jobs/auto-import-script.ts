import {CronJob, cronJob} from "@loopback/cron";
import {ScriptResult} from "../models";
import {SUPER_ADMIN} from "../constants/configurations";
import {PROGRESSING_STATUS} from "../constants/number_adminstration";
import {service} from "@loopback/core";
import {NumberService} from "../services";
import {repository} from "@loopback/repository";
import {ScriptResultRepository, ScriptSqlRepository} from "../repositories";
import DataUtils from "../utils/data";

@cronJob()
export class AutoImportScript extends CronJob {
    constructor(
        @repository(ScriptResultRepository) public scriptResultRepository: ScriptResultRepository,
        @repository(ScriptSqlRepository) public scriptSqlRepository: ScriptSqlRepository,
        @service(NumberService) public numberService: NumberService,
    ) {
        super({
            name: 'auto-import-script',
            onTick: async () => {
                this.process()
            },
            cronTime: '0 0 1 * * *',
            start: false,
        });
    }

    async process() {
        console.log("Start auto importing script.... " + new Date().toISOString())

        const sqls = await this.scriptSqlRepository.find({where: {autorun: true}})
        if (sqls && sqls.length>0) {
            for (let sql of sqls) {
                const user = await this.scriptSqlRepository.getScriptUser(sql.id)
                if (!user)
                    continue

                let sr = new ScriptResult()
                sr.user_id = SUPER_ADMIN
                sr.sql_id = sql.id!
                sr.imported = 0
                sr.message = ""
                sr.status = PROGRESSING_STATUS.WAITING
                sr.created_at = new Date().toISOString()
                sr.updated_at = new Date().toISOString()
                sr = await this.scriptResultRepository.create(sr)

                this.numberService.executeScript(sr, user)
                await DataUtils.sleep(1000)
            }
        }
    }
}