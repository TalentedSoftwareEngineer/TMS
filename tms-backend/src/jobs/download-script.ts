import {CronJob, cronJob} from "@loopback/cron";

@cronJob()
export class DownloadScript extends CronJob {
    constructor(
    ) {
        super({
            name: 'download-script',
            onTick: async () => {
            },
            cronTime: '* */10 * * * *',
            start: false,
        });
    }
}