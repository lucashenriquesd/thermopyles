import * as dotenv from 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const register = async (email: string, password: string) => {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = prisma.user.create({
    data: {
      email: email,
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

  const token: Promise<string> = generateToken(user.id)

  return token
}

const generateToken = async (userId: string) => {
  const jwtSecret: string = process.env.JWT_SECRET as string
  const payload = {
    sub: userId
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
      return { err: tokenToBeVerifiedErr }
    }
  } catch (authorizedTokenErr) {
    return { err: authorizedTokenErr }
  }
}

export { register, login, verifyToken }