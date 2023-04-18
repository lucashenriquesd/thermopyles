import { Request, Response } from 'express'
import pino from 'pino'
import { Prisma } from '@prisma/client'
import Joi, { ValidationError } from 'joi'
import * as authService from './service'

const logger = pino();

const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const schema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'br'] } })
        .required(),
      password: Joi.string()
        .pattern(new RegExp(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/))
        .required()
    })

    await schema.validateAsync({ email, password })

    const addedUser = await authService.register(email, password)

    return res.status(201).send(addedUser)
  }
  catch (err) {
    logger.error(err)
    const title = 'unable to register user'

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).send({ error: { title, messages: ['email already exists'] } })
      }
    }

    if (err instanceof ValidationError) {
      return res.status(400).send({ error: { title, messages: [err.message] } })
    }

    if (err instanceof Error) {
      return res.status(501).send({ error: { title, messages: ['Internal Server Error'] } })
    }
  }
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  const jwt: boolean | string = await authService.login(email, password)

  if (!jwt) {
    return res.status(400).send({ message: 'unauthorized' })
  }

  return res.status(200).send({ jwt })
}

const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.params

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send('Authorization header is missing')
  }

  const authorizedToken = authHeader.split(' ')[1]
  if (!authorizedToken) {
    return res.status(401).send('JWT is missing')
  }

  const decodedToken = await authService.verifyToken(token, authorizedToken)

  return res.status(200).send(decodedToken)
}

const createPermission = async (req: Request, res: Response) => {
  const { permissionName } = req.body
  const createdPermission = await authService.createPermission(permissionName)

  if ('error' in createdPermission) {
    return res.status(409).send(createdPermission)
  }

  return res.status(201).send(createdPermission)
}

const activatePermission = async (req: Request, res: Response) => {
  const { permissionName, active } = req.body
  const permission = await authService.activatePermission(permissionName, active)

  return res.status(200).send(permission)
}

export { register, login, verifyToken, createPermission, activatePermission }