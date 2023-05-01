export const CONFIGURATIONS = {
    SQLSCRIPT_SFTP: 'sqlscript.sftpconfig',
    NEWS_EVENT: 'system.news_event',
}

export const SERVER_TIMEOFFSET = process.env.NODE_ENV=='production' ? 0.0 : 9.0;

export const REQ_SIZE = 10

export const SUPER_ADMIN = 1
export const SUPER_ADMIN_ROLE = 1

export const DEFAULT_TIMEOUT = 60