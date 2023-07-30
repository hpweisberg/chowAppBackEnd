import { Profile } from '../models/profile.js'
import { v2 as cloudinary } from 'cloudinary'
import { Post } from '../models/post.js'
import { User } from '../models/user.js'
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
  const { handle } = req.user;

  try {
    let updatedData = req.body;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updatedData.photo = result.secure_url;
    }
    // Update the user model if the requested key-value pair is present
    if (updatedData.name) {
      const user = await User.findOne({ handle });
      user.name = updatedData.name;
      await user.save();
    }

    const profile = await Profile.findOneAndUpdate(
      { handle },
      updatedData,
      { new: true }
    );
    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

async function updatePhoto(req, res) {
  try {
    const imageFile = req.files.photo.path;
    const profile = await Profile.findOne({ handle: req.params.handle }); // Update this line

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const image = await cloudinary.uploader.upload(imageFile, { 
      tags: `${req.user.email}`,
      transformation: [
        {
          width: 600,
          height: 600,
          crop: 'fill',
          gravity: 'center',
        },
      ],
    });
    profile.photo = image.url;

    await profile.save();
    res.status(201).json(profile.photo);
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
      { 
        tags: `${req.user.email}`,
        transformation: [
          {
            width: 600,
            height: 600,
            crop: 'fill',
            gravity: 'center',
          },
        ],
      }
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
  // I need to get the profile photo, name and handle of the user who sent the friend request

  const { handle } = req.user;

  try {
    const profile = await Profile.findOne({ handle });
    if (!profile || !profile.friendRequests || profile.friendRequests.length === 0) {
      return res.status(404).json({ message: 'No friend requests' });
    }

    const requestHandles = profile.friendRequests;
    const requestProfiles = await Profile.find({ handle: { $in: requestHandles } });

    res.status(200).json(requestProfiles);
  } catch {
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

async function follow(req, res) {
  try {
    const friendProfile = await Profile.findOne({ handle: req.params.handle });
    const userProfile = await Profile.findOne({ handle: req.user.handle });

    if (!friendProfile || !userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (friendProfile.equals(userProfile)) {
      return res.status(401).json({ message: 'You cannot send a follow request to yourself' });
    }

    if (friendProfile.followRequests.includes(userProfile.handle)) {
      return res.status(401).json({ message: 'You have already sent a follow request' });
    }

    if (friendProfile.followPublic === false) {
      friendProfile.followRequests.push(userProfile.handle);
      await friendProfile.save();
    } else {
      userProfile.following.push(friendProfile.handle);
      await userProfile.save();
      friendProfile.followers.push(userProfile.handle);
      await friendProfile.save();
    }

    return res.status(200).json(friendProfile);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}




async function unfollow(req, res) {
  try {
    const userProfile = await Profile.findOne({ handle: req.user.handle });
    const otherProfile = await Profile.findOne({ handle: req.params.handle });

    if (!userProfile || !otherProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    if (userProfile.equals(otherProfile)) {
      return res.status(401).json({ message: 'You cannot unfollow yourself' });
    }
    if (!userProfile.following.includes(otherProfile.handle)) {
      return res.status(401).json({ message: 'You are not following this person' });
    }

    if (userProfile.following.includes(otherProfile.handle)) {
      userProfile.following = userProfile.following.filter(
        (follow) => follow !== otherProfile.handle
      );
      await userProfile.save();
    }

    if (otherProfile.followers.includes(userProfile.handle)) {
      otherProfile.followers = otherProfile.followers.filter(
        (followed) => followed !== userProfile.handle
      );
      await otherProfile.save();
    }

    res.status(200).json({ message: 'Successfully unfollowed' });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function followersList(req, res) {
  const { handle } = req.user;

  try {
    const profile = await Profile.findOne({ handle });
    if (!profile || !profile.followers || profile.followers.length === 0) {
      return res.status(404).json({ message: 'No followers' });
    }

    const followHandles = profile.followers;
    const followProfiles = await Profile.find({ handle: { $in: followHandles  } });

    res.status(200).json(followProfiles);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function followingList(req, res) {
  const { handle } = req.user;
  try {
    const profile = await Profile.findOne({ handle });
    if (!profile || !profile.following || profile.following.length === 0) {
      return res.status(401).json({ message: 'Not following any profiles' });
    }

    const followingHandles = profile.following;
    const followingProfiles = await Profile.find({ handle: { $in: followingHandles } });

    res.status(200).json(followingProfiles);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function followRequests(req, res) {
  const { handle } = req.user;
  try {
    const userProfile = await Profile.findOne({ handle: req.user.handle });
    if (!userProfile || !userProfile.followRequests || userProfile.followRequests.length === 0) {
      return res.status(401).json({ message: 'No follow requests' });
    }

    const followRequests = await Profile.find({ handle: { $in: userProfile.followRequests } });
    res.status(200).json(followRequests);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function acceptFollowRequest(req, res) {
  const { handle } = req.user;
  try {
    const userProfile = await Profile.findOne({ handle: req.user.handle });
    const otherProfile = await Profile.findOne({ handle: req.params.handle });
    if (!userProfile || !otherProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (userProfile.equals(otherProfile)) {
      return res.status(401).json({ message: 'You cannot send a follow request to yourself' });
    }

    if (otherProfile.followers.some(request => request.handle === userProfile.handle)) {
      return res.status(401).json({ message: 'You have already sent a follow request' });
    }

    if (userProfile.followers.includes(otherProfile.handle)) {
      return res.status(401).json({ message: 'You are already following this person' });
    }
    

    otherProfile.following.push(userProfile.handle);
    // otherProfile.followRequests.pull(userProfile.handle);
    await otherProfile.save();

    userProfile.followers.push(otherProfile.handle);
    userProfile.followRequests.pull(otherProfile.handle);
    await userProfile.save();

    res.status(200).json(otherProfile);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function rejectFollowRequest(req, res) {
  const { handle } = req.user;
  try {
    const userProfile = await Profile.findOne({ handle: req.user.handle });
    const otherProfile = await Profile.findOne({ handle: req.params.handle });
    if (!userProfile || !otherProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (userProfile.equals(otherProfile)) {
      return res.status(401).json({ message: 'You cannot send a follow request to yourself' });
    }

    if (!userProfile.followRequests.includes(otherProfile.handle)) {
      return res.status(401).json({ message: 'You have not recieved a follow request from this person' });
    }

    userProfile.followRequests.pull(otherProfile.handle);
    await userProfile.save();

    res.status(200).json(otherProfile);
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
  unfriend,
  follow,
  unfollow,
  followersList,
  followingList,
  followRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  updatePhoto
}
