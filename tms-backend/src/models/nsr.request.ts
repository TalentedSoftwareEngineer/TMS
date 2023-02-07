
export class NSRRequest {
    ro: string;
    type: string;
    submitType: string;
    qty?: number;
    cons?: string;

    npa?: string;
    nxx?: string;
    line?: string;

    wildCardNum?: string;
    specificNums?: [];

    contactName?: string
    contactNumber?: string

    constructor() {
    }
}
