export class UserCreateRequest {
    username: string;
    email: string;

    first_name: string;
    last_name: string;

    company_id: number;
    somos_id: number;
    role_id: number;

    timezone: number;

    password: string;

    country?: string;
    address?: string;
    province?: string;
    city?: string;
    zip_code?: string;
    tel1?: string;
    tel2?: string;
    mobile?: string;
    fax?: string;
    contact_name?: string;
    contact_number?: string;

    constructor() {
    }
}