export const ROUTES = {
  login: '/authenticate',
  dashboard: '/service/dashboard',
  account: '/service/account',
  sql_script_exe: '/service/script_exe',
  resp_org: '/service/resp_org',
  configuration: {
    roles: '/service/roles',
    somos_users: '/service/somos_users',
    users: '/service/users',
    company: '/service/company',
    sql_scripts: '/service/sql_scripts',
    sql_users: '/service/sql_users',
    id_ro: '/service/id_ro',
  },
  activity_task: {
    activity: '/service/activity',
    task_tracking: '/service/task_tracking'
  },
  numberAdministration: {
    numberSearch: '/service/number_search',
    numberList: '/service/number_list',
    reservedNumberList: '/service/reserved_numbers',
    numberQuery: '/service/number_query',
    oneClickActivation: '/service/one_click_activation',
    troubleReferralNumberQuery: '/service/trouble_referral_number_query',
  },
  sysAutoAdmin: {
    multiDialNumQuery: '/service/multi_dial_num_query',
    multiDialNumDisconnect: '/service/multi_dial_num_disconnect',
    multiDialNumSpare: '/service/multi_dial_num_spare',
    multiDialNumRespOrgChange: '/service/multi_dial_num_resp_change',
    multiConversion_pointerRecord: '/service/multi_conversion_pointer_record',
    autoReserveNumbers: '/service/auto_reserve_numbers',
  },
  customerAdmin: {
    cad: '/service/cad',
    pad: '/service/pad'
  },
  templateAdmin: {
    tad: '/service/tad',
    trl: '/service/trl'
  },
  roc: {
    rsb: '/service/roc_rsb',
    rsr: '/service/roc_rsr',
    rlu: '/service/roc_rlu',
    rsn: '/service/roc_rsn',
    rrn: '/service/roc_rrn',
  }
}
