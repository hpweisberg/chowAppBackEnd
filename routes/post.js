import { Router } from 'express'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'
import * as postCtrl from '../controllers/post.js'

const router = Router()

/*---------- Public Routes ----------*/
// router.post('/signup', authCtrl.signup)
// router.post('/login', authCtrl.login)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.post('/', checkAuth, postCtrl.create)
router.get('/', checkAuth, postCtrl.index)
router.get('/:id', checkAuth, postCtrl.show)
router.put('/:id', checkAuth, postCtrl.update)
router.delete('/:id', checkAuth, postCtrl.deletePost)
// router.post('/change-password', checkAuth, authCtrl.changePassword)

export { router }
