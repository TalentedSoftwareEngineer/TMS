export const PUBLIC_KEY = '/etc/letsencrypt/live/tmsdev.tfnms.com/fullchain.pem'
export const PRIVATE_KEY = '/etc/letsencrypt/live/tmsdev.tfnms.com/privkey.pem'
export const SERVER = "tmsdev.tfnms.com"

export const TEMPORARY = process.env.NODE_ENV=='production' ? '/tmp/' : 'e:/tmp/'
export const SCRIPT_HOME = process.env.NODE_ENV=='production' ? '/home/tfnmadmin/script/' : 'e:/tmp/'

export const RSMQ_QUEUE = "activities"
export const RSMQ_CONFIG: any = {
    namespace: 'tollfree_number_management_system',
    redis: {
        // @ts-ignore
        client: 'redis',
        options: {
            // @ts-ignore
            host: '127.0.0.1',
            port: 6789,
            connect_timeout: 3600000,
        },
    },
    logger: {
        enabled: false,
        options: {
            level: 'error',
        },
    },
    messages: {
        store: {// false,
            deadLettered: {
                queueSize: 5000,
                expire: 24 * 60 * 60 * 1000
            },
        }
    },
}
