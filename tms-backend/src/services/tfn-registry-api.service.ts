import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from "@loopback/repository";
import {TfnRegistryTokenRepository} from "../repositories";
import {UserProfile} from "@loopback/security";
import {AuthorizedUserProfile, TfnRegistryToken} from "../models";
import DateTimeUtils from "../utils/datetime";
import axios, {HttpStatusCode} from "axios";
import {HttpErrors} from "@loopback/rest";
import {MESSAGES} from "../constants/messages";

@injectable({scope: BindingScope.TRANSIENT})
export class TfnRegistryApiService {

  isProduction = false
  BASEPATH_SANDBOX = "https://sandbox-api-tfnregistry.somos.com/"
  BASEPATH_PRODUCTION = "https://api-tfnregistry.somos.com/"

  VERSION = "v3/ip";
  ACCEPT_VERSION = "3.8"

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
    RetrieveRespOrgByUnit: '/org/resporg/',
    RetrieveRespOrgByEntity: '/org/resporg/ent/',
    RetrieveRespOrgByNumber: '/org/resporg/num/',

    // Number Administration
    SearchRandomNumbers: '/num/tfn/random',
    SearchWildcardNumbers: '/num/tfn/wildcards',
    SearchSpecificNumbers: '/num/tfn/specific',

    SearchAndReserveRandomNumbers: '/num/tfn/srchres/random',
    SearchAndReserveWildcardNumbers: '/num/tfn/srchres/wildcards',
    SearchAndReserveSpecificNumbers: '/num/tfn/srchres/specific',

    QueryNumberData: '/num/tfn/query',
    UpdateNumber: '/num/tfn/update',

    QueryTroubleReferralNumber: '/num/trq',

    CreateMultiNumberDisconnectForNumber: '/cus/rec/mnd',
  }

  constructor(
      @repository(TfnRegistryTokenRepository)
      public tokenRepository: TfnRegistryTokenRepository,
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

  async openSession(id: number, username: string, password: string, isThrownException: boolean): Promise<any> {
    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.OpenSession, {
        method: 'post',
        data: {
          usrName: username,
          password: password,
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        if (error.code == this.ErrorCodes.AlreadyLogged)
          return await this.openSessionWithOverrideKey(id, username, password, response.data.sessOverrideKey, isThrownException)

        if (isThrownException)
          throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
        return error
      }

      return await this.tokenRepository.saveFromTfnRegistry(id, response.data)
    } catch (err) {
      console.log("---------- Exception in openSession ----------")
      console.log(err.response)

      const error = this.parseErrorList(err)
      if (isThrownException)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      return error
    }
  }

  async openSessionWithOverrideKey(id: number, username: string, password: string, sessOverrideKey: string, isThrownException: boolean): Promise<any> {
    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.OpenSession, {
        method: 'post',
        data: {
          usrName: username,
          password: password,
          sessOverrideKey: sessOverrideKey,
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        if (isThrownException)
          throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
        return error
      }

      return await this.tokenRepository.saveFromTfnRegistry(id, response.data)
    } catch (err) {
      console.log("---------- Exception in openSessionWithOverrideKey ----------")
      console.log(err.response)

      const error = this.parseErrorList(err.response)
      if (isThrownException)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      return error
    }
  }

  async refreshToken(token: TfnRegistryToken, isThrownException: boolean): Promise<any> {
    try {
      const response: any = await axios((this.isProduction ? this.BASEPATH_PRODUCTION : this.BASEPATH_SANDBOX) + "token", {
        method: 'post',
        params: {
          grant_type: "refresh_token",
          refresh_token: token.refresh_token,
        },
        auth: {
          username: token.client_key,
          password: token.client_secret,
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        if (isThrownException)
          throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
        return error
      }

      return await this.tokenRepository.saveFromTfnRegistry(token.id, response.data)

    } catch (err) {
      console.log("---------- Exception in refreshToken ----------")
      console.log(err.response)

      // await this.closeSession(token)
      const error = this.parseErrorList(err.response)
      if (isThrownException)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      return error
    }
  }

  async closeSession(token: TfnRegistryToken, isThrownException: boolean) {
    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CloseSession, {
        method: 'put',
        data: {
          clientKey: token.client_key,
          clientSecret: token.client_secret,
        },
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      }

      await this.tokenRepository.deleteById(token.id)
    } catch (err) {
      console.log("---------- Exception in closeSession ----------")
      console.log(err.response)

      const error = this.parseErrorList(err.response)
      throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
    }
  }

  /**
   * Get OAuth2 Token. if expires, refresh token or override token.
   * @param profile
   */
  async getToken(profile: AuthorizedUserProfile, isThrownException: boolean): Promise<any> {
    let token = await this.tokenRepository.findOne({ where: {id: profile.somos.id}})
    let isOpen = false
    if (token) {
      const now = DateTimeUtils.getCurrentTimestamp();
      if (now <= token.expires_at + 10 && now >= token.expires_at - 10)
        token = await this.refreshToken(token, isThrownException)
      else if (now > token.expires_at - 10)
        isOpen = true
    } else {
      isOpen = true
    }

    if (isOpen)
      token = await this.openSession(profile.somos.id!, profile.somos.username, profile.somos.password, isThrownException)

    return token
  }


  /**
   * This API allows the SMS/800 TFN Registry user to list all the Resp Org Units in the system.
   * @param profile
   */
  async listRespOrgEntity(profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile, true)
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

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      }

      // console.log(response.data)
      if (response.data.respOrgList)
        return response.data.respOrgList

      throw new HttpErrors.InternalServerError(this.Messages.InvalidResponse)
    } catch (err) {
      console.log("---------- Exception in listRespOrgEntity ----------")
      console.log(err.response)

      const error = this.parseErrorList(err.response)
      throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
    }
  }

  /**
   * This API allows the SMS/800 TFN Registry user to list all the Resp Org Units in the system.
   * @param profile
   */
  async listRespOrgUnit(profile: AuthorizedUserProfile): Promise<any> {
    const token = await this.getToken(profile, true)
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

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      }

      // console.log(response.data)
      if (response.data.respOrgList)
        return response.data.respOrgList

      throw new HttpErrors.BadRequest(this.Messages.InvalidResponse)
    } catch (err) {
      console.log("---------- Exception in listRespOrgEntity ----------")
      console.log(err.response)

      const error = this.parseErrorList(err.response)
      throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
    }
  }

  private async retrieveRespOrg(url: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, true)

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

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      }

      return response.data
    } catch (err) {
      console.log("---------- Exception in retrieveRespOrg ----------")
      console.log(err.response)

      const error = this.parseErrorList(err.response)
      throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
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
    const token = await this.getToken(profile, false)
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
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (error) {
      console.log("---------- Exception in searchNumbers ----------")
      console.log(error.response)

      return error.response
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
    return await this.searchNumbers(this.getBasePath() + this.EndPoints.SearchSpecificNumbers, ro, payload, profile)
  }

  private async retrieveSearchNumbers(url: string, ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, false)
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
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
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
    const token = await this.getToken(profile, false)
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
          'ROID': ro,
          'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (error) {
      console.log("---------- Exception in searchAndReserveNumbers ----------")
      console.log(error.response)

      return error.response
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
    return await this.searchAndReserveNumbers(this.getBasePath() + this.EndPoints.SearchAndReserveSpecificNumbers, ro, payload, profile)
  }


  private async retrieveSearchAndReserveNumbers(url: string, ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, false)
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
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
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
   * Query the System for information related to specified Toll-Free Number.
   * @param ro
   * @param num
   * @param requestDesc
   * @param profile
   */
  async queryNumberData(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, false)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.QueryNumberData, {
        method: 'put',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      }

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryNumberData ----------")
      console.log(err.response)

      return err.response
    }
  }

  /**
   * Retreive the System for information related to specified Toll-Free Number-SyncTimeout.
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveNumberData(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, false)
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
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (error) {
      console.log("---------- Exception in retrieveNumberData ----------")
      console.log(error.response)

      return error.response
    }
  }


  /**
   * Update the information related to specified Toll-Free Number.
   * @param ro
   * @param num
   * @param requestDesc
   * @param conName
   * @param conPhone
   * @param profile
   */
  async updateNumber(ro: string, num: string, conName: string, conPhone: string, shrtNotes: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, false)
    if (token.code && token.message)
      return token

    try {
      let data: any = {
        numList: [num],
        conName, conPhone, shrtNotes
      }

      const response: any = await axios(this.getBasePath() + this.EndPoints.UpdateNumber, {
        method: 'put',
        data: data,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      }

      return response.data
    } catch (err) {
      console.log("---------- Exception in updateNumber ----------")
      console.log(err.response)

      return err.response
    }
  }

  /**
   * Update the information related to specified Toll-Free Number-SyncTimeout.
   * @param ro
   * @param reqId
   * @param profile
   */
  async retrieveUpdateNumber(ro: string, reqId: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, false)
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
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      return response.data
    } catch (error) {
      console.log("---------- Exception in retrieveUpdateNumber ----------")
      console.log(error.response)

      return error.response
    }
  }

  /**
   * Select or specify a Toll-Free Number or list of Toll-Free Numbers and retrieve the Resp Org's trouble referral Number for Customer Record administration.
   * @param ro
   * @param numList
   * @param profile
   */
  async queryTroubleReferralNumber(ro: string, numList: string, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, false)
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
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      }

      return response.data
    } catch (err) {
      console.log("---------- Exception in queryTroubleReferralNumber ----------")
      console.log(err.response)

      return err.response
    }
  }

  /**
   * Create disconnect records for an entire set of Toll-Free Numbers at the same time in one single request (based on configured limit).
   * @param ro
   * @param profile
   */
  async createMultiNumberDisconnectForNumber(ro: string, payload: any, profile: AuthorizedUserProfile) {
    const token = await this.getToken(profile, false)
    if (token.code && token.message)
      return token

    try {
      const response: any = await axios(this.getBasePath() + this.EndPoints.CreateMultiNumberDisconnectForNumber, {
        method: 'post',
        data: payload,
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token.oouth_token,
          ROID: ro,
          'Accept-Version': this.ACCEPT_VERSION,
        }
      })

      if (!response.data || response.data.errList) {
        const error = this.parseErrorList(response)
        throw new HttpErrors.BadRequest(error.message + (error.code!="" ? " Code: " + error.code : ""))
      }

      return response.data
    } catch (err) {
      console.log("---------- Exception in createMultiNumberDisconnectForNumber ----------")
      console.log(err.response)

      return err.response
    }
  }

}
