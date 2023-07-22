import { Router } from 'express'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'
import * as profilesCtrl from '../controllers/profiles.js'

const router = Router()

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.get('/', checkAuth, profilesCtrl.index)
router.get('/friends', checkAuth, profilesCtrl.friendList)
router.get('/followers-list', checkAuth, profilesCtrl.followersList)
router.get('/following-list', checkAuth, profilesCtrl.followingList)
router.get('/follow-requests', checkAuth, profilesCtrl.followRequests)
router.get('/requests', checkAuth, profilesCtrl.friendRequests)
router.get('/:handle', checkAuth, profilesCtrl.show)
router.put('/:handle', checkAuth, profilesCtrl.update)
router.put('/:handle/add-photo', checkAuth, profilesCtrl.addPhoto)
router.patch('/:handle/send-friend-request', checkAuth, profilesCtrl.sendFriendRequest)
router.patch('/:handle/accept-friend-request', checkAuth, profilesCtrl.acceptFriendRequest)
router.patch('/:handle/reject-friend-request', checkAuth, profilesCtrl.rejectFriendRequest)
router.patch('/:handle/unfriend', checkAuth, profilesCtrl.unfriend)
router.patch('/:handle/follow', checkAuth, profilesCtrl.follow)
router.patch('/:handle/unfollow', checkAuth, profilesCtrl.unfollow)

/*---------- Admin Routes ----------*/

export { router }
