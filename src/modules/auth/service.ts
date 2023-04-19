import * as dotenv from 'dotenv'
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

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
  })

  if (!user) {
    return false
  }

  const emailAndPasswordMatched: boolean = await bcrypt.compare(password, user.password)

  if (!emailAndPasswordMatched) {
    return false
  }

  const token: string = await generateToken(user.id, user.email)

  return token
}

const generateToken = async (userId: string, email: string) => {
  const jwtSecret: string = process.env.JWT_SECRET as string
  const payload = {
    sub: userId,
    iss: 'thermopyles',
    email
  }

  const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' })

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

export { register, login, verifyToken, createPermission, activatePermission }