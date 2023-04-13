import { Router } from 'express'
import { register, login, verifyToken } from './controller'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/verify-token/:token', verifyToken)

export default router
