export class OCARequest {
    ro: string;
    type: string;
    qty?: number;
    cons?: string;

    npa?: string;
    nxx?: string;
    line?: string;

    wildCardNum?: string;
    specificNums?: [];

    contactName: string
    contactNumber: string

    templateName: string
    numTermLine: number
    serviceOrder: string
    effDtTm: string
    timezone: string

    constructor() {
    }
}
