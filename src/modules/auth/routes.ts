import { Router } from 'express'
import { register, login, verifyToken, createPermission, activatePermission, revokeToken } from './controller'
import { checkRevokedToken } from './middlewares/check-revoked-tokens-middleware'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/verify-token/:token', checkRevokedToken, verifyToken)
router.post('/revoke-token/:token', revokeToken)
router.post('/create-permission', createPermission)
router.patch('/activate-permission', activatePermission)

export default router
