import {User} from "./user.model";
import {SomosUser} from "./somos-user.model";

export class AuthorizedUserProfile  {
  user: User;
  permissions: [];
  somos: SomosUser;

  constructor(data?: Partial<AuthorizedUserProfile>) {
  }
}

