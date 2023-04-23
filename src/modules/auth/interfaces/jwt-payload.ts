interface jwtPayload {
  jti: string,
  iss: string,
  sub: string,
  exp: number,
  email: string
}

export { jwtPayload }