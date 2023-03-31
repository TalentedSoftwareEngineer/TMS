import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import axios from "axios";

@injectable({scope: BindingScope.TRANSIENT})
export class Secure382ApiService {

  URL = "https://secure1.382com.com/peer/tollfree.cgi"
  USERNAME = "digitalipvoicenycsbc-nextdid"
  PASSWORD = "r0fl2sdpw"

  constructor(

  ) {}

  async sendNumbers(ro: string, numList: string[]) {
    const numbers = numList.join(" ")

    try {
      const response: any = await axios(this.URL, {
        method: 'post',
        data: {
          user: this.USERNAME,
          pass: this.PASSWORD,
          email: "support@tfnms.com",
          mou: 1,
          payphone: 'y',
          dids: numbers,
          resporg: ro,
          "cic0555": 'y',
        },
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      console.log(response?.data)
      return response.data
    } catch (err) {
      console.log(err)
    }

  }

}
