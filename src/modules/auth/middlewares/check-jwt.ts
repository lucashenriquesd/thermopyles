import { Request, Response, NextFunction } from 'express'
import * as AuthService from '../service'

const checkJwt = (routePermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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

    const isUserAuthorized = await AuthService.isUserAuthorized(authorizedToken, routePermission)
    if (!isUserAuthorized) {
      return res.status(403).send('Forbidden')
    }

    next()
  };
};

export { checkJwt }