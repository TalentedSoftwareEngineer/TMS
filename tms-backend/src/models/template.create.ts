export class TemplateCreateRequest {
  tmplName: string;
  description?: string;
  respOrg?: string;
  effDtTm?: string;
  custRecStat?: string;
  apprStat?: string;
  custRecCompPart?: string;

  constructor() {
  }
}
