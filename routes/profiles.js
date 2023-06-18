import { Router } from 'express'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'
import * as profilesCtrl from '../controllers/profiles.js'

const router = Router()

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.get('/', checkAuth, profilesCtrl.index)
router.get('/friends', checkAuth, profilesCtrl.friendList)
router.get('/requests', checkAuth, profilesCtrl.friendRequests)
router.get('/:id', checkAuth, profilesCtrl.show)
router.put('/:id', checkAuth, profilesCtrl.update)
router.put('/:id/add-photo', checkAuth, profilesCtrl.addPhoto)
router.patch('/:id/acceptFriendRequest', checkAuth, profilesCtrl.acceptFriendRequest)
router.patch('/:id/rejectFriendRequest', checkAuth, profilesCtrl.rejectFriendRequest)
router.patch('/:id/unfriend', checkAuth, profilesCtrl.unfriend)
router.patch('/:id/sendFriendRequest', checkAuth, profilesCtrl.sendFriendRequest)

export { router }
