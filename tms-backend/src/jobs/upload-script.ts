import {CronJob, cronJob} from "@loopback/cron";

@cronJob()
export class UploadScript extends CronJob {
    constructor(
    ) {
        super({
            name: 'upload-script',
            onTick: async () => {
            },
            cronTime: '0 0 0 * * *',
            start: false,
        });
    }
}