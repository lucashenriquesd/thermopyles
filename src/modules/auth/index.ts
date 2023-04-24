import { Router } from 'express'
import { register, login, verifyToken, createPermission, activatePermission, revokeToken, addPermissionToUser } from './controller'
import { checkJwt } from './middlewares/check-jwt'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/verify-token/:token', checkJwt('/verify-token/:token'), verifyToken)
router.post('/revoke-token/:token', revokeToken)
router.post('/create-permission', createPermission)
router.patch('/activate-permission', activatePermission)
router.post('/add-permission-to-user', addPermissionToUser)

export default router
