import { Request, Response, NextFunction, RequestHandler } from 'express'
import * as AuthService from '../service'

const checkRevokedToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send('Authorization header is missing')
  }

  const authorizedToken = authHeader.split(' ')[1]
  if (!authorizedToken) {
    return res.status(401).send('JWT is missing')
  }

  const isTokenRevoked = await AuthService.isTokenRevoked(authorizedToken)
  if (isTokenRevoked) {
    return res.status(401).send('Unauthorized')
  }

  next()
}

export { checkRevokedToken }