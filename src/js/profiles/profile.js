import { get } from '../api/get.js';
import { put } from '../api/put.js';

async function getProfile(name) {
  try {
    const response = await get(`auction/profiles/${name}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
}

async function updateProfile(name, profileData) {
  try {
    const response = await put(`auction/profiles/${name}`, profileData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

async function updateAvatar(name, avatarData) {
  try {
    const response = await put(`auction/profiles/${name}`, {
      avatar: avatarData
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update avatar: ${error.message}`);
  }
}

export {
  getProfile,
  updateProfile,
  updateAvatar
};
