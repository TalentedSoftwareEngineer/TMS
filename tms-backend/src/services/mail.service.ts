import {injectable, /* inject, */ BindingScope} from '@loopback/core';

@injectable({scope: BindingScope.TRANSIENT})
export class MailService {
  constructor(

  ) {}

  public async send() {

  }
}
