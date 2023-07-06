import { Profile } from '../models/profile.js'
import { v2 as cloudinary } from 'cloudinary'
import { Post } from '../models/post.js'
import * as mongoose from 'mongoose'
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

const show = async (req, res) => {
  const { handle } = req.params;

  try {
    const profile = await Profile.findOne({ handle }).populate('posts').sort({ createdAt: 'desc' });
    res.status(200).json(profile);
    // console.log(profile)
  } catch (error) {
    res.status(500).json(error);
  }
};


async function update(req, res) {
  const { handle } = req.params;

  try {
    const profile = await Profile.findOneAndUpdate(
      { handle }, // Updated query to match handle
      req.body,
      { new: true }
    );
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


async function addPhoto(req, res) {
  try {
    const imageFile = req.files.photo.path
    const profile = await Profile.findById(req.params.handle)

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

async function friendList(req, res) {
  const { handle } = req.user;
  console.log('handle:', handle);

  try {
    const profile = await Profile.findOne({ handle });
    if (!profile || !profile.friends || profile.friends.length === 0) {
      return res.status(404).json({ message: 'No friends' });
    }

    const friendHandles = profile.friends;
    const friendProfiles = await Profile.find({ handle: { $in: friendHandles } });

    res.status(200).json(friendProfiles);
  } catch (error) {
    res.status(500).json(error);
  }
}



// async function friendList(req, res) {
//   try {
//     const userProfile = await Profile.findById(req.user.profile).populate('friends').sort({ createdAt: 'desc' })
//     console.log(userProfile)
//     const friendList = userProfile.friends
//     if (friendList.length === 0) {
//       return res.status(404).json({ message: 'No friends' })
//     }
//     res.status(200).json(friendList)
//   } catch (error) {
//     res.status(500).json(error)
//   }
// }



async function friendRequests(req, res) {
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


async function sendFriendRequest(req, res) {
  try {
    const friendProfile = await Profile.findOne({ handle: req.params.handle }).populate('friendRequests');
    const userProfile = await Profile.findOne({ handle: req.user.handle }).populate('friendRequests');

    if (!friendProfile || !userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (friendProfile.equals(userProfile)) {
      return res.status(401).json({ message: 'You cannot send a friend request to yourself' });
    }

    if (friendProfile.friendRequests.some(request => request.handle === userProfile.handle)) {
      return res.status(401).json({ message: 'You have already sent a friend request' });
    }

    if (userProfile.friends.includes(friendProfile.handle)) {
      return res.status(401).json({ message: 'You are already friends with this person' });
    }

    friendProfile.friendRequests.push(userProfile.handle);
    await friendProfile.save();
    res.status(200).json(friendProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


async function acceptFriendRequest(req, res) {
  try {
    const userProfile = await Profile.findOne({ handle: req.user.handle });
    const friendProfile = await Profile.findOne({ handle: req.params.handle });
    // console.log('friendProfile: ', friendProfile.handle)
    // console.log('userProfile: ', userProfile.handle)

    if (!userProfile.friendRequests.includes(friendProfile.handle)) {
      return res.status(401).json({ message: 'You have not received a friend request' });
    }

    if (userProfile.equals(friendProfile)) {
      return res.status(401).json({ message: 'You cannot add yourself as a friend' });
    }

    if (userProfile.friends.includes(friendProfile.handle)) {
      return res.status(400).json({ message: 'Friend already added' });
    }

    friendProfile.friendRequests.pull(userProfile.handle);
    friendProfile.friends.push(userProfile.handle);
    await friendProfile.save();

    userProfile.friends.push(friendProfile.handle);
    userProfile.friendRequests.pull(friendProfile.handle);
    await userProfile.save();

    return res.status(200).json(friendProfile);
  } catch (error) {
    res.status(500).json(error);
  }
}



async function rejectFriendRequest(req, res) {
  try {
    const userProfile = await Profile.findById(req.user.profile);
    userProfile.friendRequests.pull(req.params.handle);
    await userProfile.save();
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json(error);
  }
}


async function unfriend(req, res) {
  try {
    const userProfile = await Profile.findOne({ handle: req.user.handle });
    const friendProfile = await Profile.findOne({ handle: req.params.handle });
    // console.log('friendProfile: ', friendProfile.handle);
    // console.log('userProfile: ', userProfile.handle);

    if (!userProfile.friends.includes(friendProfile.handle)) {
      return res.status(401).json({ message: 'You are not friends' });
    }

    userProfile.friends = userProfile.friends.filter(
      (friend) => friend !== friendProfile.handle
    );
    await userProfile.save();

    friendProfile.friends = friendProfile.friends.filter(
      (friend) => friend !== userProfile.handle
    );
    await friendProfile.save();

    return res.status(200).json({ message: 'Successfully unfriended' });
  } catch (error) {
    res.status(500).json(error);
  }
}






export {
  index,
  show,
  update,
  addPhoto,
  friendList,
  friendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend
}
