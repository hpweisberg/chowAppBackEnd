import { Router } from 'express'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'
import * as authCtrl from '../controllers/auth.js'

const router = Router()

/*---------- Public Routes ----------*/
router.post('/signup', authCtrl.signup)
router.get('/is-email-unique', authCtrl.isEmailUnique)
router.get('/is-handle-unique', authCtrl.isHandleUnique)
router.post('/login', authCtrl.login)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.post('/change-password', checkAuth, authCtrl.changePassword)
router.patch('/update', checkAuth, authCtrl.update)

export { router }
