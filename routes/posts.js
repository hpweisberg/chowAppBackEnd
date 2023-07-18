import { Router } from 'express'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'
import * as postsCtrl from '../controllers/posts.js'

const router = Router()

/*---------- Public Routes ----------*/
// router.post('/signup', authCtrl.signup)
// router.post('/login', authCtrl.login)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.post('/', checkAuth, postsCtrl.create)
router.get('/', checkAuth, postsCtrl.index)
router.get('/friends', checkAuth, postsCtrl.indexByFriends)
router.get('/:id', checkAuth, postsCtrl.show)
router.put('/:id', checkAuth, postsCtrl.update)
router.delete('/:id', checkAuth, postsCtrl.deletePost)
router.put('/:id/add-photo', checkAuth, postsCtrl.addPhoto)
// router.put('/:id/add-restaurant', checkAuth, postsCtrl.addRestaurant)
// router.post('/change-password', checkAuth, authCtrl.changePassword)

export { router }
