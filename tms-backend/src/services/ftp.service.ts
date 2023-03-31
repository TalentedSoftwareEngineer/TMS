import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from "@loopback/repository";
import {ConfigurationRepository} from "../repositories";
import {CONFIGURATIONS} from "../constants/configurations";
import {TEMPORARY} from "../config";
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
    const config: any = await this.configurationRepository.findById(CONFIGURATIONS.SQLSCRIPT_SFTP);
    if (!config)
      return {success: false, message: 'FTP Configuration is invalid.'}

    return this.put(config.value.host, config.value.port, config.value.remotePath, user.username, user.password, filename)
  }

  private async put(host: string, port: number, path: string, username: string, password: string, filename: string): Promise<any> {
    return new Promise((resolve) => {
      const Client = require('ftp')
      let client = new Client()

      client.on('ready', async () => {
        client.put(TEMPORARY + filename, path + username + "/" + filename, (err: any) => {
          if (err)
            resolve({success: false, message: err?.message})
          else {
            client.end()
            resolve({success: true, message: "Success"})
          }
        })
      })
      .on('error', (err: any) => {
        console.log("error", err)
        resolve({success: false, message: err?.message})
      })

      client.connect({
        host: host,
        port: port,
        secure: true,
        user: username,
        password: password,
      })
    })
  }

  async list(user: any, filename: string) {
    const config: any = await this.configurationRepository.findById(CONFIGURATIONS.SQLSCRIPT_SFTP);
    if (!config)
      return {success: false, message: 'FTP Configuration is invalid.'}

    return this.ls(config.value.host, config.value.port, config.value.remotePath, user.username, user.password, filename)
  }

  private async ls(host: string, port: number, path: string, username: string, password: string, filename: string): Promise<any> {
    return new Promise((resolve) => {
      const Client = require('ftp')
      let client = new Client()

      client.on('ready', async () => {
        client.list(path + username, (err: any, list: any[]) => {
          if (err)
            resolve({success: false, message: err?.message})
          else {
            client.end()
            resolve({success: true, message: "Success", list})
          }
        })
      })
      .on('error', (err: any) => {
        console.log("error", err)
        resolve({success: false, message: err?.message})
      })

      client.connect({
        host: host,
        port: port,
        secure: true,
        user: username,
        password: password,
      })
    })
  }

  async download(user: any, filename: string) {
    // TODO - upload file to FTP
    // https://www.npmjs.com/package/ftp

    const config: any = await this.configurationRepository.findById(CONFIGURATIONS.SQLSCRIPT_SFTP);
    if (!config)
      return {success: false, message: 'FTP Configuration is invalid.'}

    return this.get(config.value.host, config.value.port, config.value.remotePath, user.username, user.password, filename)
  }

  private async get(host: string, port: number, path: string, username: string, password: string, filename: string): Promise<any> {
    return new Promise((resolve) => {
      const Client = require('ftp')
      let client = new Client()

      client.on('ready', async () => {
        const file = await client.get(path + username + "/" + filename)
        const ws = fs.createWriteStream(TEMPORARY + filename)
        file.pipe(ws).on('end', ()=> {
            resolve({success: true, message: "Success"})
          })
          .on('error', (err: any) => {
            console.log("error", err)
            resolve({success: false, message: err?.message})
          })
      })
      .on('error', (err: any) => {
        console.log("error", err)
        resolve({success: false, message: err?.message})
      })

      client.connect({
        host: host,
        port: port,
        secure: true,
        user: username,
        password: password,
      })
    })
  }

}
