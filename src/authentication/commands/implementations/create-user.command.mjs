'use strict'

export class CreateUserCommand {
  constructor (body) {
    this.email = body.email
    this.password = body.password
    this.confirmPassword = body.confirmPassword
    this.firstName = body.firstName
    this.lastName = body.lastName
  }
}

export function createUserCommand (body) {
  return new CreateUserCommand(body)
}
