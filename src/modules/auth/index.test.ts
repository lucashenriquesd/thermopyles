import { test, expect } from 'vitest'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import * as AuthService from './service'
import { jwtPayload } from './interfaces/jwt-payload'

dotenv.config()

test('generate token', async () => {
  const generatedToken = await AuthService.generateToken('userid1234', 'email@email.com', [])
  const jwtSecret: string = process.env.JWT_SECRET as string
  const authorizedTokenDecoded = jwt.verify(generatedToken, jwtSecret)
  expect(authorizedTokenDecoded).toHaveProperty('jti')
})

test('fail to generate token with wrong secret', async () => {
  try {
    const generatedToken = await AuthService.generateToken('userid1234', 'email@email.com', [])
    const jwtSecret: string = '123'
    jwt.verify(generatedToken, jwtSecret)
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
  }
  
})

test('generate token with permissions', async () => {
  const generatedToken = await AuthService.generateToken('userid1234', 'email@email.com', ['permission123'])
  const jwtSecret: string = process.env.JWT_SECRET as string
  const authorizedTokenDecoded = jwt.verify(generatedToken, jwtSecret) as jwtPayload
  expect(authorizedTokenDecoded).toHaveProperty('permissions')
  expect(authorizedTokenDecoded.permissions?.length).toBeGreaterThan(0)
})

test('generate token without permissions', async () => {
  const generatedToken = await AuthService.generateToken('userid1234', 'email@email.com', [])
  const jwtSecret: string = process.env.JWT_SECRET as string
  const authorizedTokenDecoded = jwt.verify(generatedToken, jwtSecret) as jwtPayload
  expect(authorizedTokenDecoded).toHaveProperty('permissions')
  expect(authorizedTokenDecoded.permissions).toHaveLength(0)
})