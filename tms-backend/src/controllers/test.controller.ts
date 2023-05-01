// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {HttpErrors, post, Request, requestBody, Response, RestBindings} from "@loopback/rest";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {NSRRequest} from "../models/nsr.request";
import {FILE_UPLOAD_SERVICE, FileUploadHandler, NumberService} from "../services";
import * as fs from "fs";
import {repository} from "@loopback/repository";
import {ScriptResultRepository, ScriptSqlRepository} from "../repositories";
import {ScriptResult} from "../models";
import {NUMBER_STATUS, PROGRESSING_STATUS} from "../constants/number_adminstration";
import {SUPER_ADMIN} from "../constants/configurations";
import {SCRIPT_HOME} from "../config";
import DataUtils from "../utils/data";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";

export class TestController {
  constructor(
      @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
      @service(NumberService) public numberService: NumberService,
      @repository(ScriptResultRepository) public scriptResultRepository: ScriptResultRepository,
      @repository(ScriptSqlRepository) public scriptSqlRepository: ScriptSqlRepository,
  ) {}

  @post('/test/import', {
  description: 'Import Number',
  responses: {
    '200': {
      description: 'NSRRequest ID',
      content: {
        'application/json': {
          schema: {
            type: "object",
            properties: {
              req_id: {
                type: "string"
              }
            }
          }
        }
      },
    }
  }
})
  async import() {
    const buffer = fs.readFileSync("e:/tmp/xqg01rxk_edlle0b0k6ov2954f14my9.out")
    let content = buffer.toString()
    if (content!="") {
      // TODO - parse content
      let blockList
        blockList = content.split("TEMPLATENAME")

      let results: any[] = [];

      if(blockList.length > 1) {
        blockList.forEach(block=>{
          let rowList = block.split("\n")

          if (rowList.length > 3) {
            for(let i=2; i <= rowList.length - 2; i++) {
              console.log("row-------", rowList[i])

              if(!Boolean(rowList[i]) || rowList[i][0] != '*') break

              var line: string = rowList[i].replace("\t", " ").replace("\t", " ")
              console.log("line", line)

              while (line.includes("  "))
                line = line.replace("  ", " ")

              let itemList = line.split(" ")

              if (itemList.length != 4) continue

              let status = NUMBER_STATUS.SPARE
              if (itemList[3]=="A")
                status = NUMBER_STATUS.WORKING
              // else if (itemList[3]=='P')
              //   status = NUMBER_STATUS.SUSPEND
              // else if (itemList[3]=='D')
              //   status = NUMBER_STATUS.DISCONNECT
              // else if (itemList[3]=='R')
              //   status = NUMBER_STATUS.RESERVED
              // else if (itemList[3]=='T')
              //   status = NUMBER_STATUS.TRANSITIONAL
              // else if (itemList[3]=='U')
              //   status = NUMBER_STATUS.UNAVAILABLE
              // else if (itemList[3]=='W')
              //   status = NUMBER_STATUS.WORKING

              results.push({roId: itemList[0] + itemList[1], number: itemList[2], status});
            }
          }
        });
      }


      return results
    }
  }

  async upload(
      @requestBody.file()
          request: Request,
      @inject(RestBindings.Http.RESPONSE) response: Response,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ROC_SUBMIT_REQUEST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return new Promise<object>((resolve, reject) => {
      this.handler(request, response, (err) => {
        if (err) {
          reject(err)
        } else {
          const uploadedFiles = request.files;
          console.log("uploadedFiles", request.body, uploadedFiles)

          const mapper = (f: globalThis.Express.Multer.File) => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            encoding: f.encoding,
            mimetype: f.mimetype,
            size: f.size,
          });

          let files: object[] = [];
          if (Array.isArray(uploadedFiles)) {
            files = uploadedFiles.map(mapper);
          } else {
            for (const filename in uploadedFiles) {
              files.push(...uploadedFiles[filename].map(mapper));
            }
          }

          console.log(files, request.body)
          resolve({files, fields: request.body})
        }
      });
    })
  }
}
