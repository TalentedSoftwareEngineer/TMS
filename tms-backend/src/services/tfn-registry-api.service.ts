import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from "@loopback/repository";
import {TfnRegistryTokenRepository} from "../repositories";
import {UserProfile} from "@loopback/security";
import {AuthorizedUserProfile, SomosUser, TfnRegistryToken} from "../models";
import DateTimeUtils from "../utils/datetime";
import axios, {HttpStatusCode} from "axios";
import {HttpErrors} from "@loopback/rest";
import {MESSAGES} from "../constants/messages";
import FormData from "form-data";
import doc = Mocha.reporters.doc;

@injectable({scope: BindingScope.TRANSIENT})
export class TfnRegistryApiService {

  isProduction = true // process.env.NODE_ENV=='production'
  BASEPATH_SANDBOX = "https://sandbox-api-tfnregistry.somos.com/"
  BASEPATH_PRODUCTION = "https://api-tfnregistry.somos.com/"

  VERSION = "v3/ip";
  ACCEPT_VERSION = "3.2"
  ROC_ACCEPT_VERSION = "3.11"

  ErrorCodes = {
    AlreadyLogged: "701003",
  };

  Messages = {
    UnknownError: "Unknown Error is occurred.",
    ExceptionError: "Exception is occurred.",
    OverrideError: "Failed to override session.",

    InvalidResponse: "Response Format is invalid.",
  }

  EndPoints = {
    // Session
    OpenSession: '/sec/session/open',
    CloseSession: '/sec/session/close',

    // Organization Administration
    ListRespOrgEntity: '/org/resporg/respOrgEntity',
    ListRespOrgUnit: '/org/resporg/respOrgUnit',
    ListRespOrgByReqId: '/org/resporg',

    RetrieveRespOrgByUnit: '/org/resporg/',
    RetrieveRespOrgByEntity: '/org/resporg/ent/',
    RetrieveRespOrgByNumber: '/org/resporg/num/',

    // Number Administration
    SearchRandomNumbers: '/num/tfn/random',
    SearchWildcardNumbers: '/num/tfn/wildcard',
    SearchSpecificNumbers: '/num/tfn/specific',

    SearchAndReserveRandomNumbers: '/num/tfn/srchres/random',
    SearchAndReserveWildcardNumbers: '/num/tfn/srchres/wildcard',
    SearchAndReserveSpecificNumbers: '/num/tfn/srchres/specific',

    RetrieveBulkSearchAndReserve: '/sys/bsr/blkId/',

    QueryNumberData: '/num/tfn/query',
    QueryNumberDataByBulkId: '/sys/mnq/blkId/',
    UpdateNumber: '/num/tfn/update',
    RetrieveNumberSpareByBlkID: '/sys/msp/blkId/',

    QueryTroubleReferralNumber: '/num/trq',

    CreateMultiNumberDisconnectForNumber: '/cus/rec/mnd',
    CreateMultiNumberDisconnectForNumberByBlkID: '/sys/mnd/blkId/',

    ChangeRespOrgOfTollFreeNumber: '/num/rch',
    ChangeRespOrgOfTollFreeNumberByBlkID: '/sys/mro/blkId/',

    ListTemplateRecords: '/cus/tpl/lst/entity/',
    ListTemplateRecordsByReqId: '/cus/tpl/lst',
    QueryTemplateRecord: '/cus/tpl/query/',
    QueryTemplateRecordByReqId: '/cus/tpl/query',
    RetrieveTemplateRecord: '/cus/tpl/tmplName/',
    RetrieveTemplateRecordByReqId: '/cus/tpl',
    LockTemplateRecord: '/cus/tpl/lock',
    UnlockTemplateRecord: '/cus/tpl/unlock',
    CreateTemplateRecord: '/cus/tpl',
    UpdateTemplateRecord: '/cus/tpl',
    CopyTemplateRecord: '/cus/tpl/copy',
    TransferTemplateRecord: '/cus/tpl/transfer',
    DisconnectTemplateRecord: '/cus/tpl/disconnect',
    DeleteTemplateRecord: '/cus/tpl/tmplName/{tmplName}/effDtTm/{effDtTm}/recVersionId/{recVersionId}',

    QueryCustomerRecord: '/cus/rec/query/',
    QueryCustomerRecordByReqId: '/cus/rec/query',
    RetrieveCustomerRecord: '/cus/rec/tfnum/',
    RetrieveCustomerRecordByReqId: '/cus/rec',
    LockCustomerRecord: '/cus/rec/lock',
    UnlockCustomerRecord: '/cus/rec/unlock',
    CreateCustomerRecord: '/cus/rec',
    UpdateCustomerRecord: '/cus/rec',
    CopyCustomerRecord: '/cus/rec/copy',
    TransferCustomerRecord: '/cus/rec/transfer',
    DisconnectCustomerRecord: '/cus/rec/disconnect',
    DeleteCustomerRecord: '/cus/rec/tfnum/{num}/effDtTm/{effDtTm}/recVersionId/{recVersionId}',
    ConvertCustomerRecordToPointerRecord: '/cus/rec/cnv',
    ConvertCustomerRecordToPointerRecordByBlkID: '/sys/mcp/blkId/',

    QueryPointerRecord: '/cus/ptr/query/',
    RetrievePointerRecord: '/cus/ptr/tfnum/',
    RetrievePointerRecordByReqId: '/cus/ptr',
    LockPointerRecord: '/cus/ptr/lock',
    UnlockPointerRecord: '/cus/ptr/unlock',
    CreatePointerRecord: '/cus/ptr',
    UpdatePointerRecord: '/cus/ptr',
    CopyPointerRecord: '/cus/ptr/copy',
    TransferPointerRecord: '/cus/ptr/transfer',
    DisconnectPointerRecord: '/cus/ptr/disconnect',
    DeletePointerRecord: '/cus/ptr/tfnum/{num}/effDtTm/{effDtTm}/recVersionId/{recVersionId}',
    ConvertPointerRecordToCustomerRecord: '/cus/ptr/cnv',

    OneClickActivationRandomNumbers: '/num/oca/random',
    OneClickActivationWildcardNumbers: '/num/oca/wildcard',
    OneClickActivationSpecificNumbers: '/num/oca/specific',
    OneClickActivationByBlkID: '/sys/oca/blkId/',

    ReservedNumberList: '/num/rnl',

    ListBulkRequest: '/sys/bulk/lst',

    // ROC
    GenerateLOAFileRequest: '/roc/generateLoa',
    UploadLOAFileRequest: '/roc/uploadLOA',
    UploadAdditionalDocumentRequest: '/roc/uploadDoc',
    UploadFileRequest: '/roc/uploadFile',

    SubmitROCRequest: '/roc/submit',
    SearchROCRequest: '/roc/search',
    SearchROCByTransactionIDRequest: '/roc/searchTxn',
    RetrieveROCRequest: '/roc/retrieve/txnid/',
    RetrieveROCRequestByReqId: '/roc/retrieve',
    RetrieveDocumentRequest: '/roc/retrieveDocument',
    RemoveTFNRequest: '/roc/removeTfn',
    CancelROCRequest: '/roc/cancel',
    ProcessROCRequest: '/roc/processRoc',
    CheckinROCRequest: '/roc/checkin',
    CheckoutROCRequest: '/roc/checkout',
    EscalateROCRequest: '/roc/escalate',
    ResubmitHDIRequest: 'roc/resubmitHDI',

    SubscriptionRequest: '/roc/subscription',
    RetrieveListOfFailedNotificationRequest: '/roc/resendRetrieve',
    ResendFailedNotificationRequest: '/roc/resendNtfn',
  }

  constructor(
      @repository(TfnRegistryTokenRepository) public tokenRepository: TfnRegistryTokenRepository,
  ) {}

  getBasePath() {
    return (this.isProduction ? this.BASEPATH_PRODUCTION : this.BASEPATH_SANDBOX) + this.VERSION
  }

  parseErrorList(response: any): any {
    let errList: [] | null = null;
    if (response!=null && response.data!=null && response.data.errList!=null)
      errList = response.data.errList
    else if (response!=null && response.errList!=null)
      errList = response.errList

    if (errList==null || errList.length==0) {
      if (response!=null && response!="")
        return { code: "", message: response }

      return { code: "", message: MESSAGES.INTERNAL_SERVER_ERROR }
    }

    console.log("------------- Error List -----------------")
    console.log(errList)

    // @ts-ignore
    const error: any = errList[0]
    return { code: error.errCode+"", message: error.errMsg }
  }

  async openSession(id: number, username: string, password: string): Promise<any> {
    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.OpenSession, {
        method: 'post',
        data: {
          usrName: username,
          password: password,
          withPerm: true,
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        if (error.code == this.ErrorCodes.AlreadyLogged)
          return await this.openSessionWithOverrideKey(id, username, password, response.data.sessOverrideKey)

        return error
      }

      return await this.tokenRepository.saveFromTfnRegistry(id, response.data)
    } catch (err) {
      console.log("---------- Exception in openSession ----------")
      console.log(err?.response?.data)

      const error = this.parseErrorList(err)
      return error
    }
  }

  async openSessionWithOverrideKey(id: number, username: string, password: string, sessOverrideKey: string): Promise<any> {
    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.OpenSession, {
        method: 'post',
        data: {
          usrName: username,
          password: password,
          withPerm: true,
          sessOverrideKey: sessOverrideKey,
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        return error
      }

      return await this.tokenRepository.saveFromTfnRegistry(id, response.data)
    } catch (err) {
      console.log("---------- Exception in openSessionWithOverrideKey ----------")
      console.log(err?.response?.data)

      const error = this.parseErrorList(err.response)
      return error
    }
  }

  async refreshToken(token: TfnRegistryToken, somos: SomosUser): Promise<any> {
    let auth: any = {}
    if (token!=null) {
      auth.username = token.client_key
      auth.password = token.client_secret
    }

    if (somos.client_key!=undefined && somos.client_key!="")
      auth.username = somos.client_key

    if (somos.client_secret!=undefined && somos.client_secret!="")
      auth.password = somos.client_secret

    let params: any = {
      refresh_token: "",
      grant_type: "refresh_token"
    }

    if (token!=null)
      token.refresh_token = token.refresh_token

    try {
      const response: any = await axios((this.isProduction ? this.BASEPATH_PRODUCTION : this.BASEPATH_SANDBOX) + "token", {
        method: 'post',
        params: params,
        auth: auth,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        return error
      }

      return await this.tokenRepository.saveFromTfnRegistry(somos.id!, response.data)

    } catch (err) {
      console.log("---------- Exception in refreshToken ----------")
      console.log(err?.response?.data)

      const error = this.parseErrorList(err?.response?.data)
      return error
    }
  }

  async openToken(somos: SomosUser): Promise<any> {
    let auth: any = {}

    if (somos.client_key!=undefined && somos.client_key!="")
      auth.username = somos.client_key

    if (somos.client_secret!=undefined && somos.client_secret!="")
      auth.password = somos.client_secret

    let params: any = {
      refresh_token: null,
      grant_type: "client_credentials"
    }

    try {
      const response: any = await axios((this.isProduction ? this.BASEPATH_PRODUCTION : this.BASEPATH_SANDBOX) + "token", {
        method: 'post',
        params: params,
        auth: auth,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        return error
      }

      return await this.tokenRepository.saveFromTfnRegistry(somos.id!, response.data, somos)

    } catch (err) {
      console.log("---------- Exception in openToken ----------")
      console.log(err?.response?.data)

      const error = this.parseErrorList(err?.response?.data)
      return error
    }
  }

  // TODO - not used yet,  need to adjust returning value
  async closeSession(token: TfnRegistryToken, client_key?: string, client_secret?: string) {
    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CloseSession, {
        method: 'put',
        data: {
          clientKey: client_key && client_key!="" ? client_key : token.client_key,
          clientSecret: client_secret && client_secret!="" ? client_secret : token.client_secret,
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        return error;
      }

      await this.tokenRepository.deleteById(token.id)
    } catch (err) {
      // console.log("---------- Exception in closeSession ----------")
      // console.log(err?.response?.data)

      const error = this.parseErrorList(err.response)
      return error;
    }
  }

  /**
   * Get OAuth2 Token. if expires, refresh token or override token.
   * @param profile
   */
  async getToken(profile: AuthorizedUserProfile): Promise<any> {
    let token: any = await this.tokenRepository.findOne({ where: {id: profile.somos.id}})
    let isOpen = false
    if (token) {
      const now = DateTimeUtils.getCurrentTimestamp();
      if (now <= token.expires_at && now >= token.expires_at - 20)
        token = await this.refreshToken(token, profile.somos)
      else if (now > token.expires_at)
        isOpen = true
    } else {
      isOpen = true
    }

    if (isOpen) {
      // if (token)
      //   await this.closeSession(token, profile.somos.client_key, profile.somos.client_secret)

      if (profile.somos.client_key!=null && profile.somos.client_key!="" && profile.somos.client_secret!=null && profile.somos.client_secret!="") {
        return this.openToken(profile.somos)

      } else {

        return this.openSession(profile.somos.id!, profile.somos.username, profile.somos.password)
      }
    }

    return token
  }


  /**
   * This API allows the SMS/800 TFN Registry user to list all the Resp Org Units in the system.
   * @param profile
   */
  async listRespOrgEntity(profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ListRespOrgEntity, {
        method: 'get',
        data: {
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
        }
      })

      return response.data;
    } catch (err) {
      console.log("---------- Exception in listRespOrgEntity ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * This API allows the SMS/800 TFN Registry user to list all the Resp Org Units in the system.
   * @param profile
   */
  async listRespOrgUnit(profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ListRespOrgUnit, {
        method: 'get',
        data: {
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in listRespOrgEntity ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a new Resp Org Entity and provide the details related to the Resp Org Entity.
   * @param ro
   * @param reqId
   * @param profile
   */
  async listRespOrgByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ListRespOrgByReqId, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in listRespOrgByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  private async retrieveRespOrg(url: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(url, {
        method: 'get',
        data: {
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveRespOrg ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * This API allows the SMS/800 TFN Registry user to retrieve Resp Org Information for the specified Resp Org Unit.
   * @param unit
   * @param profile
   */
  async retrieveRespOrgByUnit(unit: string, profile: AuthorizedUserProfile): Promise<any> {
    return await this.retrieveRespOrg(this.getBasePath() + this.EndPoints.RetrieveRespOrgByUnit+unit, profile)
  }

  /**
   * This API allows the SMS/800 TFN Registry user to retrieve Resp Org Information for the specified Resp Org Entity (all Resp Org Units linked to the Resp Org Entity).
   * @param entity
   * @param profile
   */
  async retrieveRespOrgByEntity(entity: string, profile: AuthorizedUserProfile): Promise<any> {
    return await this.retrieveRespOrg(this.getBasePath() + this.EndPoints.RetrieveRespOrgByEntity+entity, profile)
  }

  /**
   * Resp Org User or Help Desk User can retrieve Resp Org Information for the specified Toll-Free Number (Control Resp Org Unit).
   * @param number
   * @param profile
   */
  async retrieveRespOrgByNumber(number: string, profile: AuthorizedUserProfile): Promise<any> {
    return await this.retrieveRespOrg(this.getBasePath() + this.EndPoints.RetrieveRespOrgByNumber+number, profile)
  }

  private async searchNumbers(url: string, ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(url, {
        method: 'put',
        data: payload,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in searchNumbers ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * This API allows the SMS/800 TFN Registry user to search for a random Toll-Free Number.
   * @param ro
   * @param payload
   * @param profile
   */
  async searchRandomNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    return await this.searchNumbers(this.getBasePath() + this.EndPoints.SearchRandomNumbers, ro, payload, profile)
  }

  /**
   * This API allows the SMS/800 TFN Registry user to search for wild-card Toll-Free Number(s).
   * @param ro
   * @param payload
   * @param profile
   */
  async searchWildcardNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    return await this.searchNumbers(this.getBasePath() + this.EndPoints.SearchWildcardNumbers, ro, payload, profile)
  }

  /**
   * This API allows the SMS/800 TFN Registry user to search for specific Toll-Free Number(s).
   * @param ro
   * @param payload
   * @param profile
   */
  async searchSpecificNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    let data = {...payload}
    if (data.qty)
      delete data.qty
    return await this.searchNumbers(this.getBasePath() + this.EndPoints.SearchSpecificNumbers, ro, data, profile)
  }

  private async retrieveSearchNumbers(url: string, ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(url, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (error) {
      console.log("---------- Exception in retrieveSearchNumbers ----------")
      console.log(error.response)

      return error.response
    }
  }

  /**
   * Retrieve search for a random Toll-Free Number-SyncTimeout.
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveSearchRandomNumbers(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.retrieveSearchNumbers(this.getBasePath() + this.EndPoints.SearchRandomNumbers, ro, reqId, profile)
  }

  /**
   * Retrieve search for wild-card Toll-Free Number(s).
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveSearchWildcardNumbers(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.retrieveSearchNumbers(this.getBasePath() + this.EndPoints.SearchWildcardNumbers, ro, reqId, profile)
  }

  /**
   * Retrieve search for specific Toll-Free Number(s).
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveSearchSpecificNumbers(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.retrieveSearchNumbers(this.getBasePath() + this.EndPoints.SearchSpecificNumbers, ro, reqId, profile)
  }

  private async searchAndReserveNumbers(url: string, ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(url, {
        method: 'post',
        data: payload,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json; charset=utf-8',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token.oouth_token,
          // 'ROID': ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in searchAndReserveNumbers ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Search and reserve one or more random Toll-Free Numbers upto 500 with status as SPARE.
   * @param ro
   * @param payload
   * @param profile
   */
  async searchAndReserveRandomNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    return await this.searchAndReserveNumbers(this.getBasePath() + this.EndPoints.SearchAndReserveRandomNumbers, ro, payload, profile)
  }

  /**
   * Search and reserve Toll-Free Number with status of SPARE using Wild Card.
   * @param ro
   * @param payload
   * @param profile
   */
  async searchAndReserveWildcardNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    return await this.searchAndReserveNumbers(this.getBasePath() + this.EndPoints.SearchAndReserveWildcardNumbers, ro, payload, profile)
  }

  /**
   * Search and reserve specific Toll-Free Number.
   * @param ro
   * @param payload
   * @param profile
   */
  async searchAndReserveSpecificNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    let data = {...payload}
    if (data.qty)
      delete data.qty
    return await this.searchAndReserveNumbers(this.getBasePath() + this.EndPoints.SearchAndReserveSpecificNumbers, ro, data, profile)
  }


  private async retrieveSearchAndReserveNumbers(url: string, ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(url, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveSearchNumbers ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Search and reserve one or more random Toll-Free Numbers upto 500 with status as SPARE
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveSearchAndReserveRandomNumbers(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.retrieveSearchAndReserveNumbers(this.getBasePath() + this.EndPoints.SearchAndReserveRandomNumbers, ro, reqId, profile)
  }

  /**
   * Search and reserve Toll-Free Number with status of SPARE using Wild Card.
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveSearchAndReserveWildcardNumbers(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.retrieveSearchAndReserveNumbers(this.getBasePath() + this.EndPoints.SearchAndReserveWildcardNumbers, ro, reqId, profile)
  }

  /**
   * Search and reserve specific Toll-Free Number.
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveSearchAndReserveSpecificNumbers(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.retrieveSearchAndReserveNumbers(this.getBasePath() + this.EndPoints.SearchAndReserveSpecificNumbers, ro, reqId, profile)
  }

  /**
   * retrieve the Bulk ID retrieved when user tries to search and reserve more than configurable quantity of Toll-Free Numbers.
   * @param ro
   * @param blkId
   * @param profile
   */
  async retrieveBulkSearchAndReserve(ro: string, blkId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveBulkSearchAndReserve+blkId, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveBulkSearchAndReserve ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Query the System for information related to specified Toll-Free Number.
   * @param ro
   * @param num
   * @param requestDesc
   * @param profile
   */
  async queryNumberData(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ...payload }
    if (data.qty)
      delete data.qty

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryNumberData, {
        method: 'put',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryNumberData ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Query the BulkId retrieved when multiple Numbers are provided as input in a single request.
   * @param ro
   * @param blkId
   * @param profile
   */
  async queryNumberDataByBlkID(ro: string, blkId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryNumberDataByBulkId+blkId, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryNumberDataByBlkID ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retreive the System for information related to specified Toll-Free Number-SyncTimeout.
   * @param ro
   * @param reqId
   * @param profile
   */
  async queryNumberDataByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryNumberData, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveNumberData ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }


  /**
   * Update the information related to specified Toll-Free Number.
   * @param ro
   * @param num
   * @param recVersionId
   * @param requestDesc
   * @param conName
   * @param conPhone
   * @param profile
   */
  async updateNumber(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UpdateNumber, {
        method: 'put',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in updateNumber ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Fetch the results of the multi Number spare request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async updateNumberByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UpdateNumber, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in updateNumberByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrieveNumberSpareByBlkID(ro: string, blkId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveNumberSpareByBlkID+blkId, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveNumberSpareByBlkID ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Select or specify a Toll-Free Number or list of Toll-Free Numbers and retrieve the Resp Org's trouble referral Number for Customer Record administration.
   * @param ro
   * @param numList
   * @param profile
   */
  async queryTroubleReferralNumber(ro: string, numList: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryTroubleReferralNumber, {
        method: 'get',
        params: {
          numList
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryTroubleReferralNumber ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Create disconnect records for an entire set of Toll-Free Numbers at the same time in one single request (based on configured limit).
   * @param ro
   * @param profile
   */
  async createMultiNumberDisconnectForNumber(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }
    if (data.qty)
      delete data.qty;

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CreateMultiNumberDisconnectForNumber, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in createMultiNumberDisconnectForNumber ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Query the BulkId retrieved Multi Number Disconnect request.
   * @param ro
   * @param blkId
   * @param profile
   */
  async createMultiNumberDisconnectForNumberByBlkID(ro: string, blkId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CreateMultiNumberDisconnectForNumberByBlkID+blkId, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in createMultiNumberDisconnectForNumberByBulkID ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Change the Resp Org of a Toll-Free Number.
   * @param ro
   * @param payload
   * @param profile
   */
  async changeRespOrgOfTollFreeNumber(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }
    if (data.qty)
      delete data.qty;

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ChangeRespOrgOfTollFreeNumber, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in changeRespOrgOfTollFreeNumber ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve the Bulk ID of Multi Number Resp Org Change request.
   * @param ro
   * @param blkId
   * @param profile
   */
  async changeRespOrgOfTollFreeNumberByBlkId(ro: string, blkId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ChangeRespOrgOfTollFreeNumberByBlkID+blkId, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in changeRespOrgOfTollFreeNumberByBlkId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  private async oneClickActivationNumbers(url: string, ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(url, {
        method: 'post',
        data: payload,
        headers: {
          'Authorization': 'Bearer ' + token.oouth_token,
          // 'ROID': ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in oneClickActivationNumbers ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * search, reserve and activate one or many Random Numbers (non-bulk) using a template record in a single request.
   * @param ro
   * @param payload
   * @param profile
   */
  async oneClickActivationRandomNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    return this.oneClickActivationNumbers(this.getBasePath() + this.EndPoints.OneClickActivationRandomNumbers, ro, payload, profile)
  }

  /**
   * search, reserve and activate one or many Numbers (non-bulk) with a wildCard Number using a template record in a single request.
   * @param ro
   * @param payload
   * @param profile
   */
  async oneClickActivationWildcardNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    return this.oneClickActivationNumbers(this.getBasePath() + this.EndPoints.OneClickActivationWildcardNumbers, ro, payload, profile)
  }

  /**
   * search, reserve and activate one or many Specific Numbers (non-bulk) using a template record in a single request.
   * @param ro
   * @param payload
   * @param profile
   */
  async oneClickActivationSpecificNumbers(ro: string, payload: any, profile: AuthorizedUserProfile): Promise<any> {
    return this.oneClickActivationNumbers(this.getBasePath() + this.EndPoints.OneClickActivationSpecificNumbers, ro, payload, profile)
  }

  /**
   * Fetch the results of the One Click Activation Bulk API using a Bulk ID.
   * @param ro
   * @param blkId
   * @param profile
   */
  async oneClickActivationByBlkId(ro: string, blkId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.OneClickActivationByBlkID+blkId, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in oneClickActivationByBlkId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  private async oneClickActivationByReqId(url: string, ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(url, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (error) {
      console.log("---------- Exception in oneClickActivationByReqId ----------")
      console.log(error.response)

      return error.response
    }
  }

  /**
   * retrieves specific number search-syncTimeOut.
   * @param ro
   * @param reqId
   * @param profile
   */
  async oneClickActivationSpecificNumbersByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.oneClickActivationByReqId(this.getBasePath() + this.EndPoints.OneClickActivationSpecificNumbers, ro, reqId, profile)
  }

  /**
   * retrieves wildCard number search-syncTimeOut.
   * @param ro
   * @param reqId
   * @param profile
   */
  async oneClickActivationWildcardNumbersByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.oneClickActivationByReqId(this.getBasePath() + this.EndPoints.OneClickActivationWildcardNumbers, ro, reqId, profile)
  }

  /**
   * retrieves random number search-syncTimeOut.
   * @param ro
   * @param reqId
   * @param profile
   */
  async oneClickActivationRandomNumbersByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    return await this.oneClickActivationByReqId(this.getBasePath() + this.EndPoints.OneClickActivationRandomNumbers, ro, reqId, profile)
  }

  /**
   * Retrieve all the Numbers reserved by the user and are in Reserved status.
   * @param ro
   * @param profile
   */
  async retrieveReservedNumberList(ro: string, profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      throw new HttpErrors.BadRequest(token.message + (token.code!="" ? " Code: " + token.code : ""))

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ReservedNumberList, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data;
    } catch (err) {
      console.log("---------- Exception in retrieveReservedNumberList ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }



  /**
   * Retrieve all the Template Records for a given Template Name.
   * @param ro
   * @param tmplName
   * @param profile
   */
  async queryTemplateRecord(ro: string, tmplName: string, profile: AuthorizedUserProfile, effDtTm?: string) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let payload: any = null
    if (effDtTm && effDtTm!="") {
      payload = {
        effDtTm,
      }
    }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryTemplateRecord+tmplName, {
        method: 'get',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async queryTemplateRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryTemplateRecordByReqId, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryTemplateRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a list of Template Records for a specific Template Name created by their own resp org entity.
   * @param entity
   * @param profile
   */
  async listTemplateRecords(ro: string, entity: string, profile: AuthorizedUserProfile, startTmplName?: string): Promise<any> {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let params: any = {}
    if (startTmplName!=null && startTmplName!=null)
      params.startTmplName = startTmplName

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ListTemplateRecords+entity, {
        method: 'get',
        params: params,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data;
    } catch (err) {
      console.log("---------- Exception in listTemplateRecords ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Reschedule entire List Record by changing its Effective Date and Time, a.k.a. “transferring” the Template Record of a Template Name to a new Effective Date and Time and the same Template Name.
   * @param ro
   * @param reqId
   * @param profile
   */
  async listTemplateRecordsByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ListTemplateRecordsByReqId, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in listTemplateRecordsByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Template Record for a given Template Name and Effective Date & Time for the purpose of viewing/reading its content.
   * @param ro
   * @param tmplName
   * @param profile
   * @param effDtTm
   */
  async retrieveTemplateRecord(ro: string, tmplName: string, profile: AuthorizedUserProfile, effDtTm?: string) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let payload: any = null
    if (effDtTm && effDtTm!="") {
      payload = {
        effDtTm,
      }
    }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveTemplateRecord+tmplName, {
        method: 'get',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Sync Time out response for Template Record API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveTemplateRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveTemplateRecordByReqId, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveTemplateRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }


  /**
   * Lock a Template Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async lockTemplateRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.LockTemplateRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in lockTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Lock a Template Record whwn ever the specific Functionllity is performed.
   * @param ro
   * @param reqId
   * @param profile
   */
  async lockTemplateRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.LockTemplateRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in lockTemplateRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Unlock a Template Record which is locked.
   * @param ro
   * @param payload
   * @param profile
   */
  async unlockTemplateRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UnlockTemplateRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in unlockTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Unlock a Template Record which is locked.
   * @param ro
   * @param reqId
   * @param profile
   */
  async unlockTemplateRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UnlockTemplateRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in unlockTemplateRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Copy Template Record (or) Template Record and CPR/LAD portions of an existing Template Record and creates a future effective Customer Record for the same or a different Template Name or to a Number.
   * @param ro
   * @param payload
   * @param profile
   */
  async copyTemplateRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CopyTemplateRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in copyTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Copy a Sync Time out response for Template Record Copy API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async copyTemplateRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CopyTemplateRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in copyTemplateRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Reschedule entire Template Record by changing its Effective Date and Time, a.k.a. “transferring” the Template Record of a Template Name to a new Effective Date and Time and the same Template Name.
   * @param ro
   * @param payload
   * @param profile
   */
  async transferTemplateRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.TransferTemplateRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in transferTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Reschedule entire Template Record by changing its Effective Date and Time, a.k.a. “transferring” the Template Record of a Template Name to a new Effective Date and Time and the same Template Name.
   * @param ro
   * @param reqId
   * @param profile
   */
  async transferTemplateRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.TransferTemplateRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in transferTemplateRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Create a new future effective disconnected Customer Record for a Template Name that has one or more Customer Records by copying Template Record (or) Template Record and CPR/LAD portions of an existing Template Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async disconnectTemplateRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.DisconnectTemplateRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in disconnectTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Sync Time out response for Template Record Disconnect API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async disconnectTemplateRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.DisconnectTemplateRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in disconnectTemplateRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Create a new Template record in the system to activate either immediately, or at a future effective date and time.
   * @param ro
   * @param payload
   * @param profile
   */
  async createTemplateRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CreateTemplateRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in createTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Modify an existing future-effective Template Record for a given Template Name (or) Template Name and Effective Date (or) Template Name and Effective Date & Time.
   * @param ro
   * @param payload
   * @param profile
   */
  async updateTemplateRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UpdateTemplateRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in updateTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Delete an existing future-effective Template Record for a given Template Name and Effective Date & Time.
   * @param ro
   * @param tmplName
   * @param effDtTm
   * @param recVersionId
   * @param profile
   */
  async deleteTemplateRecord(ro: string, tmplName: string, effDtTm: string, recVersionId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let endpoint = this.EndPoints.DeleteTemplateRecord
        .replace("{tmplName}",tmplName)
        .replace("{effDtTm}", effDtTm)
        .replace("{recVersionId}", recVersionId)

    try {
      const response: any = await axios(this.getBasePath() + endpoint, {
        method: 'delete',
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in deleteTemplateRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }




  /**
   * Retrieve all the Customer Records created for the given Number with Effective Date and time equal to or greater than the specified Effective Date and Time.
   * @param ro
   * @param num
   * @param profile
   */
  async queryCustomerRecord(ro: string, num: string, profile: AuthorizedUserProfile, effDtTm?: string) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let payload: any = null
    if (effDtTm && effDtTm!="") {
      payload = {
        effDtTm,
      }
    }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryCustomerRecord+num, {
        method: 'get',
        params: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve the sync timeout response of Customer Record POST and PUT requests.
   * @param ro
   * @param reqId
   * @param profile
   */
  async queryCustomerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryCustomerRecordByReqId, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryCustomerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Customer Record for a given Number, Effective Date and Time for the purpose of viewing/reading its content.
   * @param ro
   * @param num
   * @param profile
   * @param effDtTm
   */
  async retrieveCustomerRecord(ro: string, num: string, profile: AuthorizedUserProfile, effDtTm?: string) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let payload: any = null
    if (effDtTm && effDtTm!="") {
      payload = {
        effDtTm,
      }
    }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveCustomerRecord+num, {
        method: 'get',
        data: payload,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve Sync Time out response of Customer Record APIs.
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveCustomerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveCustomerRecordByReqId, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveCustomerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Create a Customer Record for a given Toll-Free Number, Effective Date and Time.
   * @param ro
   * @param payload
   * @param profile
   */
  async createCustomerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CreateCustomerRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in createCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Update an existing Customer Record for a given Toll-Free Number, Effective Date and Time.
   * @param ro
   * @param payload
   * @param profile
   */
  async updateCustomerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UpdateCustomerRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in updateCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Delete a Customer Record for a given Toll-Free Number, Effective Date & Time.
   * @param ro
   * @param num
   * @param effDtTm
   * @param recVersionId
   * @param profile
   */
  async deleteCustomerRecord(ro: string, num: string, effDtTm: string, recVersionId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let endpoint = this.EndPoints.DeleteCustomerRecord
        .replace("{num}",num)
        .replace("{effDtTm}", effDtTm)
        .replace("{recVersionId}", recVersionId)

    try {
      const response: any = await axios(this.getBasePath() + endpoint, {
        method: 'delete',
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in deleteCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Lock a Customer Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async lockCustomerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.LockCustomerRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in lockCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Sync Time out response for Customer Record lock API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async lockCustomerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.LockCustomerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in lockCustomerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Unlock a Customer Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async unlockCustomerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UnlockCustomerRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in unlockCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Sync Time out response for Customer Record Unlock API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async unlockCustomerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UnlockCustomerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in unlockCustomerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Copy a Customer Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async copyCustomerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CopyCustomerRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in copyCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Sync Time out response for Customer Record Copy request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async copyCustomerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CopyCustomerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in copyCustomerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Transfer a Customer Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async transferCustomerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.TransferCustomerRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in transferCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Sync Time out response for Customer Record Transfer API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async transferCustomerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.TransferCustomerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in transferCustomerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Disconnect a Customer Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async disconnectCustomerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.DisconnectCustomerRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in disconnectCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Sync Time out response for Customer Record Disconnect API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async disconnectCustomerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.DisconnectCustomerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in disconnectCustomerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Convert a Customer Record to a future or immediate (NOW) Effective Pointer Record for the same Toll-Free Number.
   * @param ro
   * @param payload
   * @param profile
   */
  async convertCustomerRecordToPointerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }
    if (data.qty)
      delete data.qty

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ConvertCustomerRecordToPointerRecord, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in convertCustomerRecordToPointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Sync Time out response for Customer Record To Pointer Record conversion API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async convertCustomerRecordToPointerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ConvertCustomerRecordToPointerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in convertCustomerRecordToPointerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Query the BulkId retrieved multiple customer to pointer records request.
   * @param ro
   * @param blkId
   * @param profile
   */
  async convertCustomerRecordToPointerRecordByBlkId(ro: string, blkId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ConvertCustomerRecordToPointerRecordByBlkID+blkId, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in convertCustomerRecordToPointerRecordByBlkId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }



  /**
   * retrieve a Pointer Record for a given Toll-Free Number and Effective Date and Time for the purpose of viewing/reading its content.
   * @param ro
   * @param num
   * @param effDtTm
   * @param profile
   */
  async queryPointerRecord(ro: string, num: string, effDtTm: string, profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryPointerRecord+num, {
        method: 'get',
        params: {
          effDtTm: effDtTm,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryPointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Retrieve a Pointer Record for a given Toll-Free Number and Effective Date and Time for the purpose of viewing/reading its content.
   * @param ro
   * @param num
   * @param profile
   * @param effDtTm
   */
  async retrievePointerRecord(ro: string, num: string, profile: AuthorizedUserProfile, effDtTm?: string) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let payload: any = null
    if (effDtTm && effDtTm!="") {
      payload = {
        effDtTm,
      }
    }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrievePointerRecord+num, {
        method: 'get',
        data: payload,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrievePointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrievePointerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrievePointerRecordByReqId, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrievePointerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * lock a Pointer Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async lockPointerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.LockPointerRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in lockPointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async lockPointerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.LockPointerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in lockPointerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * unlock a Pointer Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async unlockPointerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UnlockPointerRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in unlockPointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async unlockPointerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UnlockPointerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in unlockPointerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Create a new Pointer record in the system to activate service for a given RESERVED or TRANSITIONAL Toll-Free Number, either immediately, or at a future effective date and time.
   * @param ro
   * @param payload
   * @param profile
   */
  async createPointerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }
    if (data.qty)
      delete data.qty

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CreatePointerRecord, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in createPointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * update an existing future-effective Pointer Record for a given Toll-Free Number (or) Toll-Free Number and Effective Date (or) Toll-Free Number and Effective Date & Time.
   * @param ro
   * @param payload
   * @param profile
   */
  async updatePointerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UpdatePointerRecord, {
        method: 'put',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in updatePointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * delete Pointer Record.
   * @param ro
   * @param num
   * @param effDtTm
   * @param recVersionId
   * @param profile
   */
  async deletePointerRecord(ro: string, num: string, effDtTm: string, recVersionId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let endpoint = this.EndPoints.DeletePointerRecord
        .replace("{num}",num)
        .replace("{effDtTm}", effDtTm)
        .replace("{recVersionId}", recVersionId)

    try {
      const response: any = await axios(this.getBasePath() + endpoint, {
        method: 'delete',
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in deletePointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * copy an existing Pointer Record and creates a future effective Pointer Record for the same or a different Toll-Free Number.
   * @param ro
   * @param payload
   * @param profile
   */
  async copyPointerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CopyPointerRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in copyPointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * retrieve a Sync Time out response for Copy Pointer Record API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async copyPointerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CopyPointerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in copyPointerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * reschedule entire Pointer Record by changing its Effective Date and Time, a.k.a. “transferring” the Pointer Record of a Toll-Free Number to a new Effective Date and Time and the same Number.
   * @param ro
   * @param payload
   * @param profile
   */
  async transferPointerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.TransferPointerRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in transferPointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * retrieve a Sync Time out response for transfer Pointer Record API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async transferPointerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.TransferPointerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in transferPointerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * Disconnect a Customer Record.
   * @param ro
   * @param payload
   * @param profile
   */
  async disconnectPointerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.DisconnectPointerRecord, {
        method: 'post',
        data: data,
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in disconnectPointerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * retrieve a Sync Time out response for Customer Record Disconnect API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async disconnectPointerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.DisconnectPointerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in disconnectPointerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   *  convert an existing Pointer Record to a future or immediate (NOW) Effective Customer Record for the same Toll-Free Number.
   * @param ro
   * @param payload
   * @param profile
   */
  async convertPointerRecordToCustomerRecord(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }
    if (data.qty)
      delete data.qty

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ConvertPointerRecordToCustomerRecord, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in convertPointerRecordToCustomerRecord ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * retrieve a Sync Time out response for Pointer Record To Customer Record conversion API request.
   * @param ro
   * @param reqId
   * @param profile
   */
  async convertPointerRecordToCustomerRecordByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ConvertPointerRecordToCustomerRecord, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in convertPointerRecordToCustomerRecordByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }


  /**
   * retrieve the list of bulk requests that are initiated by the user’s Resp Org.
   * @param ro
   * @param profile
   */
  async listBulkRequest(ro: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ListBulkRequest, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveBulkRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * The following rules must be adhered to
   *    1. Request submitted for more than one number will be stored in the ROC System as an individual request for each number and will be associated with each other by a single transaction ID (TxnID).
   *        For example A request submitted with five numbers will have five individual requests recorded in the system but will be associated with the same TxnID.
   *    2. DialNumberList parameter should include a list of unique numbers.
   *    3. DialNumberList parameter cannot include any numbers with Spare or Unavailable status.
   *    4. Can only submit a ROC request to gain a TFN for a Resp Org ID within your Entity.
   *    5. The ROC documents (i.e. the LOA and other supporting documents).
   *        Please Note Only Portable . Document Format (PDF) and Tagged Image File Format (TIF/TIFF) file types can be attached to the request. If TIF or TIFF file types are attached, the file(s) will be automatically converted to a PDF file type.
   *        Total size of all files cannot exceed 2 MB; this is a configurable limit.
   * @param payload
   * @param profile
   */
  async submitROCRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SubmitROCRequest, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in submitROCRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * The following rules must be adhered to
   *    1. Request submitted for more than one number will be stored in the ROC System as an individual request for each number and will be associated with each other by a single transaction ID (TxnID).
   *        For example A request submitted with five numbers will have five individual requests recorded in the system but will be associated with the same TxnID.
   *    2. DialNumberList parameter should include a list of unique numbers.
   *    3. DialNumberList parameter cannot include any numbers with Spare or Unavailable status.
   *    4. Can only submit a ROC request to gain a TFN for a Resp Org ID within your Entity.
   *    5. The ROC documents (i.e. the LOA and other supporting documents).
   *        Please Note Only Portable . Document Format (PDF) and Tagged Image File Format (TIF/TIFF) file types can be attached to the request. If TIF or TIFF file types are attached, the file(s) will be automatically converted to a PDF file type.
   *        Total size of all files cannot exceed 2 MB; this is a configurable limit.
   * @param reqId
   * @param profile
   */
  async submitROCRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SubmitROCRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in submitROCRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async resubmitHDIRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ResubmitHDIRequest, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in resubmitHDIRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async resubmitHDIRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ResubmitHDIRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in resubmitHDIRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * This functionality allows a submitting Resp Org to generate a Standard LOA cover document.
   *    DialNumberList parameter should include a list of unique numbers.
   *    Resp Org will sign the LOA and create a request using SubmitRespOrgChange() method with LOA and include the signed Standard LOA.
   * @param payload
   * @param profile
   */
  async generateLOAFileRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.GenerateLOAFileRequest, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in generateLOAFileRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * This functionality allows a submitting Resp Org to generate a Standard LOA cover document.
   *    DialNumberList parameter should include a list of unique numbers.
   *    Resp Org will sign the LOA and create a request using SubmitRespOrgChange() method with LOA and include the signed Standard LOA.
   * @param reqId
   * @param profile
   */
  async generateLOAFileRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SubmitROCRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in generateLOAFileRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * This operation allows a submitting Resp Org to add a document to a particular Resp Org Change request.
   * The following rules must be adhered to:
   *    1. The Resp Org adding the document must be a participant as a submitting Resp Org within the Entity to change transaction related to the document.
   *    2. The Resp Org can only add the document when all numbers are in a Pending, Overdue, or Declined status with rejection status code 16.
   *    3. The ROC documents (i.e. the LOA and other supporting documents). Please Note: Only Portable Document Format (PDF) and Tagged Image File Format (TIF/TIFF) file types can be attached to the request.
   *        If TIF or TIFF file types are attached, the file(s) will be automatically converted to a PDF file type.
   *        Total size of all files cannot exceed 2 MB; this is a configurable limit.
   * @param filename
   * @param profile
   */
  async uploadLOAFileRequest(filename: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    const fs = require('fs')

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UploadLOAFileRequest, {
        method: 'post',
        data: {
          file: fs.createReadStream(filename)
        },
        headers: {
          // Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in uploadLOAFileRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  /**
   * This operation allows a submitting Resp Org to add a document to a particular Resp Org Change request.
   * The following rules must be adhered to:
   *    1. The Resp Org adding the document must be a participant as a submitting Resp Org within the Entity to change transaction related to the document.
   *    2. The Resp Org can only add the document when all numbers are in a Pending, Overdue, or Declined status with rejection status code 16.
   *    3. The ROC documents (i.e. the LOA and other supporting documents). Please Note: Only Portable Document Format (PDF) and Tagged Image File Format (TIF/TIFF) file types can be attached to the request.
   *        If TIF or TIFF file types are attached, the file(s) will be automatically converted to a PDF file type.
   *        Total size of all files cannot exceed 2 MB; this is a configurable limit.
   * @param reqId
   * @param profile
   */
  async uploadLOAFileRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UploadLOAFileRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in uploadLOAFileRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async uploadFileRequest(filename: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    const fs = require('fs')

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UploadFileRequest, {
        method: 'post',
        data: {
          file: fs.createReadStream(filename)
        },
        headers: {
          // Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in uploadFileRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async uploadFileRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UploadFileRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in uploadFileRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async uploadAdditionalDocumentRequest(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UploadAdditionalDocumentRequest, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in uploadAdditionalDocumentRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async uploadAdditionalDocumentRequestByReqId(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.UploadAdditionalDocumentRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          // 'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in uploadAdditionalDocumentRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async searchROCRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SearchROCRequest, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in searchROCRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async searchROCRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SearchROCRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in searchROCRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async searchROCByTransactionIDRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SearchROCByTransactionIDRequest, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in searchROCByTransactionIDRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async searchROCByTransactionIDRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SearchROCByTransactionIDRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in searchROCByTransactionIDRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrieveROCRequest(txnId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveROCRequest+txnId, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveROCRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrieveROCRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveROCRequestByReqId, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveROCRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrieveDocumentRequest(profile: AuthorizedUserProfile, loaID?: string, docId?: string, reqId?: string) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let params: any = {}

    if (loaID)
      params.loaID = loaID

    if (docId)
      params.docId = docId

    if (reqId)
      params.reqId = reqId

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveDocumentRequest, {
        method: 'get',
        params: params,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in resendDocumentRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async removeTFNRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RemoveTFNRequest, {
        method: 'put',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in removeTFNRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async removeTFNRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RemoveTFNRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in removeTFNRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async cancelROCRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CancelROCRequest, {
        method: 'put',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in cancelROCRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async cancelROCRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CancelROCRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in cancelROCRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async processROCRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ProcessROCRequest, {
        method: 'put',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in processROCRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async processROCRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ProcessROCRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in processROCRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async checkinROCRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CheckinROCRequest, {
        method: 'put',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in checkinROCRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async checkinROCRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CheckinROCRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in checkinROCRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async checkoutROCRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CheckoutROCRequest, {
        method: 'put',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in checkoutROCRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async checkoutROCRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CheckoutROCRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in checkoutROCRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async escalateROCRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    let data = { ... payload }

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.EscalateROCRequest, {
        method: 'post',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in escalateROCRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async escalateROCRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.EscalateROCRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in escalateROCRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrieveSubscriptionRequest(entity: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SubscriptionRequest + "/" + entity, {
        method: 'get',
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveSubscriptionRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrieveSubscriptionRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SubscriptionRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveSubscriptionRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async createSubscriptionRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SubscriptionRequest, {
        method: 'post',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in createSubscriptionRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async updateSubscriptionRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.SubscriptionRequest, {
        method: 'put',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in updateSubscriptionRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrieveListOfFailedNotificationRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveListOfFailedNotificationRequest, {
        method: 'put',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveListOfFailedNotificationRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async retrieveListOfFailedNotificationRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.RetrieveListOfFailedNotificationRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveListOfFailedNotificationRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async resendFailedNotificationRequest(payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ResendFailedNotificationRequest, {
        method: 'put',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in resendFailedNotificationRequest ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }

  async resendFailedNotificationRequestByReqId(reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.ResendFailedNotificationRequest, {
        method: 'get',
        params: {
          reqId: reqId,
        },
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + token.oouth_token,
          // ROID: ro,
          'Accept-Version': this.ROC_ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (err) {
      console.log("---------- Exception in resendFailedNotificationRequestByReqId ----------")
      console.log(err?.response?.data)
      return err?.response?.data;
    }
  }
}
