export class RoleCreateRequest {
  name: string;
  description?: string;
  privileges: [] = [];

  constructor() {
  }
}
