export class GetUserByEmailQuery {
  constructor (email) {
    this.email = email
  }
}

export function getUserByEmailQuery (email) {
  return new GetUserByEmailQuery(email)
}
