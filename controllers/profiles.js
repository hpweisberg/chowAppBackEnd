import { Profile } from '../models/profile.js'
import { v2 as cloudinary } from 'cloudinary'
import { Post } from '../models/post.js'
// import * as res from 'express/lib/response'

async function index(req, res) {
  try {
    const profiles = await Profile.find({})
    res.json(profiles)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function show(req, res) {
  try {
    const profile = await Profile.findById(req.params.id)
      .populate('posts')
      .sort({ createdAt: 'desc' })
    res.status(200).json(profile)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function update(req, res) {
  try {
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true })
    res.json(profile)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

async function addPhoto(req, res) {
  try {
    const imageFile = req.files.photo.path
    const profile = await Profile.findById(req.params.id)

    const image = await cloudinary.uploader.upload(
      imageFile,
      { tags: `${req.user.email}` }
    )
    profile.photo = image.url

    await profile.save()
    res.status(201).json(profile.photo)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

const friendRequests = async (req, res) => {
  try {
    const userProfile = await Profile.findById(req.user.profile).populate('friendRequests')
    if (userProfile.friendRequests.length === 0) {
      return res.status(404).json({ message: 'No friend requests' })
    }
    res.status(200).json(userProfile.friendRequests)
  } catch (error) {
    res.status(500).json(error)
  }
}

const sendFriendRequest = async (req, res) => {
  try {
    const friendProfile = await Profile.findById(req.params.id);
    const userProfile = await Profile.findById(req.user.profile);

    if (friendProfile.equals(userProfile)) {
      return res.status(401).json({ message: 'You cannot send a friend request to yourself' });
    }

    if (friendProfile.friendRequests.includes(userProfile._id)) {
      return res.status(401).json({ message: 'You have already sent a friend request' });
    }

    if (userProfile.friends.includes(friendProfile._id)) {
      return res.status(401).json({ message: 'You are already friends with this person' });
    }

    friendProfile.friendRequests.push(userProfile._id);
    await friendProfile.save();
    res.status(200).json(friendProfile);
  } catch (error) {
    res.status(500).json(error);
  }
};


const acceptFriendRequest = async (req, res) => {
  try {
    const userProfile = await Profile.findById(req.user.profile);
    const friendProfile = await Profile.findById(req.params.id);
    console.log('userProfile', userProfile)
    console.log('friendProfile', friendProfile)

    if (!userProfile.friendRequests.includes(friendProfile._id)) {
      return res.status(401).json({ message: 'You have not recieved a friend request' });
    }

    if (userProfile.friendRequests.includes(userProfile._id)) {
      return res.status(401).json({ message: 'You can not add yourself as a friend' });
    }

    if (userProfile.friends.includes(friendProfile._id)) {
      return res.status(400).json({ message: 'Friend already added' });
    }

    friendProfile.friendRequests.pull(userProfile._id);
    friendProfile.friends.push(userProfile._id);
    await friendProfile.save();

    userProfile.friends.push(friendProfile._id);
    userProfile.friendRequests.pull(friendProfile._id);
    await userProfile.save();

    return res.status(200).json(friendProfile);
  } catch (error) {
    res.status(500).json(error);
  }
};


const rejectFriendRequest = async (req, res) => {
  try {
    const userProfile = await Profile.findById(req.user.profile)
    userProfile.friendRequests.remove({ _id: req.params.id })
    // if (!userProfile.friendRequests.includes(req.params.id)) {
    //   res.status(401).json({ message: 'You have not recieved a friend request' })
    // }
    // ! add error handling
    await userProfile.save()
    res.status(200).json(userProfile)
  } catch (error) {
    res.status(500).json(error)
  }
}

const unfriend = async (req, res) => {
  try {
    const userProfile = await Profile.findByIdAndUpdate(req.user.profile,
      { $pull: { friends: req.params.id } },
      { new: true })
    const friendProfile = await Profile.findByIdAndUpdate(req.params.id,
      { $pull: { friends: req.user.profile } },
      { new: true })
    if (!friendProfile.friends.includes(userProfile._id)) {
      res.status(401).json({ message: 'You are not friends' })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const friendList = async (req, res) => {
  try {
    const userProfile = await Profile.findById(req.user.profile).populate('friends')
    .sort({ createdAt: 'desc' })
    const friendList = userProfile.friends
    res.status(200).json(friendList)
  } catch (error) {
    res.status(500).json(error)
  }
}



export {
  index,
  addPhoto,
  show,
  update,
  friendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  friendList,
}
