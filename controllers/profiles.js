import { Profile } from '../models/profile.js'
import { v2 as cloudinary } from 'cloudinary'
import { Post } from '../models/post.js'
import * as res from 'express/lib/response'

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
    const userProfile = await Profile.findById(req.params.id).populate('friendRequests')
    const friendRequests = userProfile.friendRequests
    res.status(200).json(friendRequests)
  } catch (error) {
    res.status(500).json(error)
  }
}

const sendFriendRequest = async (req, res) => {
  try {
    const friendProfile = await Profile.findById(req.params.id)
    const userProfile = await Profile.findById(req.user.profile)
    if (friendProfile.equals(userProfile)) {
      res.status(401).json({ message: 'You cannot send a friend request to yourself' })
    } else if (friendProfile.friendRequests.includes(userProfile._id)) {
      res.status(401).json({ message: 'You have already sent a friend request' })
    } else {
      friendProfile.friendRequests.push(userProfile._id)
      await friendProfile.save()
      res.status(200).json(friendProfile)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const acceptFriendRequest = async (req, res) => {
  try {
    const userProfile = await Profile.findById(req.user.profile)
    const friendProfile = await Profile.findById(req.params.id)
    if (!friendProfile.friendRequests.includes(userProfile._id)) {
      res.status(401).json({ message: 'You have not sent a friend request' })
    } else {
      friendProfile.friends.push(userProfile._id)
      friendProfile.friendRequests.pull(userProfile._id)
      await friendProfile.save()
      userProfile.friends.push(friendProfile._id)
      await userProfile.save()
      res.status(200).json(friendProfile)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const rejectFriendRequest = async (req, res) => {
  try {
    const userProfile = await Profile.findById(req.user.profile)
    const friendProfile = await Profile.findById(req.params.id)
    if (!friendProfile.friendRequests.includes(userProfile._id)) {
      res.status(401).json({ message: 'You have not sent a friend request' })
    } else {
      friendProfile.friendRequests.pull(userProfile._id)
      await friendProfile.save()
      res.status(200).json(friendProfile)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const unfriend = async (req, res) => {
  try {
    const userProfile = await Profile.findById(req.user.profile)
    const friendProfile = await Profile.findById(req.params.id)
    if (!friendProfile.friends.includes(userProfile._id)) {
      res.status(401).json({ message: 'You are not friends with this user' })
    } else {
      friendProfile.friends.pull(userProfile._id)
      await friendProfile.save()
      userProfile.friends.pull(friendProfile._id)
      await userProfile.save()
      res.status(200).json(friendProfile)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const friendList = async (req, res) => {
  try {
    const userProfile = await Profile.findById(req.user.profile)
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
