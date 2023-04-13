import { Request, Response } from 'express'
import * as authService from './service'

const register = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const addedUser = await authService.register(email, password)

  return res.status(200).send(addedUser)
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const emailAndPasswordMatched: boolean = await authService.login(email, password)

  return res.status(200).send(emailAndPasswordMatched)
}

export { register, login }