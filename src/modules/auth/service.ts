import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

const login = async (email: string, password: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return false
  }

  const emailAndPasswordMatched: Promise<boolean> = bcrypt.compare(password, user.password)

  return emailAndPasswordMatched
}

export { register, login }