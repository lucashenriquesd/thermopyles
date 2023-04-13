import { Request, Response } from 'express'
import * as authService from './service'

const register = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const addedUser = await authService.register(email, password)

  return res.status(200).send(addedUser)
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const jwt: boolean | string = await authService.login(email, password)

  if (!jwt) {
    return res.status(400).send({ message: 'unauthorized'})
  }

  return res.status(200).send({ jwt })
}

const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.params

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Authorization header is missing');
  }

  const authorizedToken = authHeader.split(' ')[1];
  if (!authorizedToken) {
    return res.status(401).send('JWT token is missing');
  }

  const decodedToken = await authService.verifyToken(token, authorizedToken)

  return res.status(200).send(decodedToken)
}

export { register, login, verifyToken }