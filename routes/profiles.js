import { Router } from 'express'
import { decodeUserFromToken, checkAuth } from '../middleware/auth.js'
import * as profilesCtrl from '../controllers/profiles.js'

const router = Router()

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.get('/', checkAuth, profilesCtrl.index)
router.get('/friends', checkAuth, profilesCtrl.friendList)
router.get('/:handle/followers-list', checkAuth, profilesCtrl.followersList)
router.get('/:handle/following-list', checkAuth, profilesCtrl.followingList)
router.get('/follow-requests', checkAuth, profilesCtrl.followRequests)
router.get('/requests', checkAuth, profilesCtrl.friendRequests)
router.get('/:handle', checkAuth, profilesCtrl.show)
router.put('/:handle', checkAuth, profilesCtrl.update)
router.put('/:handle/add-photo', checkAuth, profilesCtrl.addPhoto)
router.put('/:handle/update-photo', checkAuth, profilesCtrl.updatePhoto)
router.patch('/:handle/send-friend-request', checkAuth, profilesCtrl.sendFriendRequest)
router.patch('/:handle/accept-friend-request', checkAuth, profilesCtrl.acceptFriendRequest)
router.patch('/:handle/reject-friend-request', checkAuth, profilesCtrl.rejectFriendRequest)
router.patch('/:handle/unfriend', checkAuth, profilesCtrl.unfriend)
router.patch('/:handle/follow', checkAuth, profilesCtrl.follow)
router.patch('/:handle/unfollow', checkAuth, profilesCtrl.unfollow)
router.patch('/:handle/accept-follow-request', checkAuth, profilesCtrl.acceptFollowRequest)
router.patch('/:handle/reject-follow-request', checkAuth, profilesCtrl.rejectFollowRequest)

/*---------- Admin Routes ----------*/

export { router }
