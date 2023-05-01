export interface IUserLogin {
  username: string;
  password: string;
}

export interface IUserToken {
  token: string;
  user_id: number;
  rememberedIf: boolean;
}

export interface IUser {
  id: number;
  role_id: number,
  role?: IRole,
  timezone: any,
  company?: ICompany,
  somos?: ISomosUser,
  somosUser?: ISomosUser,

  username: string,
  password: string,

  email: string,
  first_name: string,
  last_name: string,
  ro: string,
  status: boolean,

  permissions?: number[],
  uiSettings: string,
  customerId: number,

  created_at: any,
  updated_at: any,
  created_by: any,
  updated_by: any,

  company_id: string | number,
  somos_id: string | number,
  userInfo?: IUserInfo,
  ui_settings: any
}

export interface IUserInfo {
  id: number,
  country: string,
  address: string,
  province: string,
  city: string,
  zip_code: string,
  tel1: string,
  tel2: string,
  mobile: string,
  fax: string,
  contact_name: string,
  contact_number: string,
  created_at: string,
  updated_at: string,
  created_by: number,
  updated_by: number
}

export interface IAuditionedUser {
  username: string,
  email: string,
  irst_name: string,
  last_name: string
}

export interface ICompany {
  id: number,
  name: string,
  code?: string,
  resp_org_id?: string,
  role_code?: string,
  company_email?: string,
  address?: string,
  city?: string,
  state?: string,
  zip_code?: string,
  first_name?: string,
  last_name?: string,
  contact_email?: string,
  contact_phone?: string,
  ro_id?: string,
  status: boolean,
  created_at: any,
  updated_at: any,
  created_by: any,
  updated_by: any
}

export interface ISomosUser {
  id: number,
  username: string,
  password?: string,
  client_key?: string,
  client_secret?: string,
  created_at: any,
  updated_at: any,
  created_by: any,
  updated_by: any
}

export interface IRole {
  id: number,
  name: string,
  description: string,
  customerId: number,
  Customer: ICustomer,
  created: Date,
  modified: Date,
  created_at: any,
  updated_at: any,
  created_by: any,
  updated_by: any,
  rolePrivileges?: IRolePrivileges[],
}


export interface IPrivilege {
  id: number,
  name: string,
  category: string,
  is_admin: number | boolean,
}

export interface IRolePrivileges {
  id: string,
  role_id: number,
  privilege_id: number
}

export interface ICustomer {
  id: number;
  balance: number;
  enabled: number | boolean;
  vatNumber: string;
  companyName: string;
  companyId: string;
  firstName: string;
  lastName: string;
  contactEmail: string;
  billingEmail: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  token: string;
  settings: string;
}

export interface ISqlUser {
  id:	number,
  username:	string,
  password:	string,
  created_at:	any,
  updated_at:	any,
  created_by: any,
  updated_by: any,
  created: any,
  updated: any
}

export interface ISqlScript {
  id:	number,
  content: string,
  autorun: boolean,
  created_at: any,
  updated_at: any,
  created_by: any,
  updated_by: any,
  user_id:	number,
  created: any,
  updated: any,
  user: ISqlUser
}

export interface IScriptResults {
  id:	string,
  imported:	number,
  message:	string,
  result:	string,
  executed_at: any,
  user_id: number,
  sql_id:	number,
  user:	ISqlUser,
  sql: ISqlScript,
  updated_at: any
}

export interface IUserActivities {
  id:	string,
  page:	string,
  operation:	string,
  total:	number,
  completed:	number,
  resp_org:	string,
  message:	string,
  status:	string,
  sub_dt_tm:	string,
  created_at:	any,
  updated_at:	any,
  user_id:	number,
  user: IUser,
}

export interface ITaskTracking {
  id:	string,
  type:	string,
  action:	string,
  del_flag:	boolean,
  resp_org:	string,
  message:	string,
  status:	string,
  sub_dt_tm:	string,
  checked:	boolean,
  is_now:	boolean,
  src_eff_dt_tm:	string,
  src_num:	string,
  src_tmpl_name:	string,
  tgt_eff_dt_tm:	string,
  tgt_num:	string,
  tgt_tmpl_name:	string,
  created_at: any,
  updated_at: any,
  user_id:	number,
  activity_id:	string,
  user: IUser,
  activity: IUserActivities
}

export interface IRetrieveRespOrg {
	respOrgEntity:	string,
	companyName:	string,
	emailId:	string,
	contactPhone:	string,
  associatedRespOrgs: IAssociatedRespOrgs[]
}

export interface IAssociatedRespOrgs {
  respOrgId:	string,
  businessUnitName:	string,
  email:	string,
  troubleRef:	string,
  status: string,
}
