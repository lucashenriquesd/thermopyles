interface jwtPayload {
  jti: string,
  iss: string,
  sub: string,
  exp: number,
  email: string,
  permissions?: string[]
}

export { jwtPayload }