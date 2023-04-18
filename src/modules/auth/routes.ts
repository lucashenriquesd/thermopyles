import { Router } from 'express'
import { register, login, verifyToken, createPermission, activatePermission } from './controller'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/verify-token/:token', verifyToken)
router.post('/create-permission', createPermission)
router.patch('/activate-permission', activatePermission)

export default router
