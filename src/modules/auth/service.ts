import * as dotenv from 'dotenv'
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4} from 'uuid'
import { Redis } from 'ioredis'
import { jwtPayload } from './interfaces/jwt-payload'

dotenv.config()

const redis = new Redis(6379, 'redis')
const prisma = new PrismaClient()

const register = async (email: string, password: string) => {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await prisma.user.create({
    data: {
      email,
      password: hash
    },
  })

  return user
}

const login = async (email: string, password: string): Promise<boolean | string> => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      permissions: {
        where: {
          active: true,
          permission: {
            active: true
          }
        },
        include: {
          permission: true
        }
      }
    }
  })

  if (!user) {
    return false
  }

  const emailAndPasswordMatched: boolean = await bcrypt.compare(password, user.password)

  if (!emailAndPasswordMatched) {
    return false
  }

  const permissions = user.permissions.map(permissions => permissions.permission.name)
  const token: string = await generateToken(user.id, user.email, permissions)

  return token
}

const generateToken = async (userId: string, email: string, permissions: string[]) => {
  const jwtSecret: string = process.env.JWT_SECRET as string
  const payload: jwtPayload | jwt.JwtPayload = {
    jti: uuidv4(),
    iss: 'thermopyles',
    sub: userId,
    email,
    permissions
  }

  const token = jwt.sign(payload, jwtSecret, { expiresIn: '2w' })

  return token
}

const verifyToken = async (tokenToBeVerified: string, authorizedToken: string) => {
  try {
    const jwtSecret: string = process.env.JWT_SECRET as string
    const authorizedTokenDecoded = jwt.verify(authorizedToken, jwtSecret)
    
    try {
      const tokenToBeVerifiedDecoded = jwt.verify(tokenToBeVerified, jwtSecret)

      return tokenToBeVerifiedDecoded
    } catch (tokenToBeVerifiedErr) {
      return { e: tokenToBeVerifiedErr }
    }
  } catch (authorizedTokenErr) {
    return { e: authorizedTokenErr }
  }
}

const createPermission = async (permissionName: string) => {
  try {
    const permission = await prisma.permission.create({
      data: {
        name: permissionName,
      },
    })
  
    return permission
  } catch (e) {
    const errorMessage: string[] = []

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        errorMessage.push('permission already exists')
      }
    }

    return { error: { title: 'unable to create permission', messages: errorMessage } }
  }
}

const activatePermission = async (permissionName: string, active: boolean) => {
  const updatedPermission = await prisma.permission.update({
    where: {
      name: permissionName,
    },
    data: {
      active,
    },
  })

  return updatedPermission
}

const revokeToken = async (token: string): Promise<boolean> => {
  try {
    const jwtSecret: string = process.env.JWT_SECRET as string
    const payload = jwt.verify(token, jwtSecret) as jwtPayload
    const revokedToken = await isTokenRevoked(token)

    if (revokedToken) {
      return false
    }

    const redisJwtVar = `thermopyles:revoked-token:${payload.jti}`
    const expiresFromJwtInSeconds = payload.exp - Math.floor(Date.now() / 1000)
    const expiresPlus5MinutesInSeconds = expiresFromJwtInSeconds + 300

    await redis.set(redisJwtVar, JSON.stringify(payload))
    await redis.expire(redisJwtVar, expiresPlus5MinutesInSeconds)

    return true
  } catch (error) {
    throw error
  }
}

const isTokenRevoked = async (token: string): Promise<boolean> => {
  try {
    const jwtSecret: string = process.env.JWT_SECRET as string
    const payload = jwt.verify(token, jwtSecret) as jwtPayload
    const revokedToken = await redis.get(`thermopyles:revoked-token:${payload.jti}`)

    if (revokedToken) {
      return true
    }

    return false
  } catch (error) {
    throw error
  }
}

const isUserAuthorized = async (token: string, permission: string): Promise<boolean> => {
  try {
    const jwtSecret: string = process.env.JWT_SECRET as string
    const payload = jwt.verify(token, jwtSecret) as jwtPayload

    if (payload.permissions?.includes(permission)) {
      return true
    }
    
    return false
  } catch (error) {
    throw error
  }
}

const addPermissionToUser = async (email: string, permissionName: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
  
    if (!user) {
      throw Error
    }

    const permission = await prisma.permission.findUnique({
      where: {
        name: permissionName,
      },
    })

    if (!permission) {
      throw Error
    }

    const userPermission = await prisma.userPermission.create({
      data: {
        userId: user.id,
        permissionId: permission.id,
      },
    })

    return userPermission
  } catch (error) {
    throw error
  }
}

export { register, login, verifyToken, createPermission, activatePermission, revokeToken, isTokenRevoked, isUserAuthorized, addPermissionToUser, generateToken }