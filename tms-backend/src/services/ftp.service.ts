import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from "@loopback/repository";
import {ConfigurationRepository} from "../repositories";
import {CONFIGURATIONS} from "../constants/configurations";
import {SCRIPT_HOME, TEMPORARY} from "../config";
import * as fs from "fs";

@injectable({scope: BindingScope.TRANSIENT})
export class FtpService {
  constructor(
      @repository(ConfigurationRepository)
      public configurationRepository : ConfigurationRepository,
  ) {}

  async upload(user: any, filename: string) {
    // TODO - upload file to FTP
    // https://www.npmjs.com/package/ftp
    const conf: any = await this.configurationRepository.findById(CONFIGURATIONS.SQLSCRIPT_SFTP);
    if (!conf)
      return {success: false, message: 'FTP Configuration is invalid.'}

    const config = JSON.parse(conf.value)
    return this.put(config.host, Number(config.port), config.remotePath, user.username, user.password, filename)
  }

  private async getConfig(host: string, port: number, username: string, password: string) {
    let config: any = {
      host,
      port,
      username,
      password
    }

    return config
  }

  private async put(host: string, port: number, path: string, username: string, password: string, filename: string): Promise<any> {
    return new Promise(async (resolve) => {
      const Client = require('ssh2-sftp-client')
      let client = new Client()

      const config = await this.getConfig(host, port, username, password)

      client.connect(config)
          .then(() => {
            return client.put(SCRIPT_HOME + filename, path + "/" + username + "/" + filename)
          })
          .finally(() => {
            client.end()
            resolve({success: true, message: "Success"})
          })
          .catch( (err: any) => {
            resolve({success: false, message: err?.message})
          })
    })
  }

  async list(user: any, filename: string) {
    const conf: any = await this.configurationRepository.findById(CONFIGURATIONS.SQLSCRIPT_SFTP);
    if (!conf)
      return {success: false, message: 'FTP Configuration is invalid.'}

    const config = JSON.parse(conf.value)
    return this.ls(config.host, Number(config.port), config.remotePath, user.username, user.password, filename)
  }

  private async ls(host: string, port: number, path: string, username: string, password: string, filename: string): Promise<any> {
    return new Promise(async (resolve) => {
      const Client = require('ssh2-sftp-client')
      let client = new Client()

      const config = await this.getConfig(host, port, username, password)

      client.connect(config)
          .then(() => {
            return client.list(path + "/" + username)
          })
          .then((data: any) => {
            resolve({success: true, message: "Success", list: data})
          })
          .finally(() => {
            client.end()
          })
          .catch( (err: any) => {
            resolve({success: false, message: err?.message})
          })
    })
  }

  async download(user: any, filename: string) {
    // TODO - upload file to FTP
    // https://www.npmjs.com/package/ftp

    const conf: any = await this.configurationRepository.findById(CONFIGURATIONS.SQLSCRIPT_SFTP);
    if (!conf)
      return {success: false, message: 'FTP Configuration is invalid.'}

    const config = JSON.parse(conf.value)
    return this.get(config.host, Number(config.port), config.remotePath, user.username, user.password, filename)
  }

  private async get(host: string, port: number, path: string, username: string, password: string, filename: string): Promise<any> {
    return new Promise(async (resolve) => {
      const Client = require('ssh2-sftp-client')
      let client = new Client()

      const config = await this.getConfig(host, port, username, password)

      client.connect(config)
          .then(() => {
            return client.get(path + "/" + username + "/" + filename, SCRIPT_HOME + filename)
          })
          .finally(() => {
            client.end()
            resolve({success: true, message: "Success"})
          })
          .catch( (err: any) => {
            resolve({success: false, message: err?.message})
          })
    })
  }

}
