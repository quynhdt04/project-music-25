import { get, patch, post, put, del } from "../utils/request";
// const API_DOMAIN = `http://127.0.0.1:8000/`;
const API_DOMAIN = import.meta.env.VITE_API_BASE_URL;

export const get_all_songs = async () => {
  const result = await get(`api/songs`);
  return result;
};

export const create_new_song = async (data) => {
  const result = await post(`api/songs/create`, data);
  return result;
};

export const get_latest_song = async () => {
  const result = await get(`api/songs/latest`);
  return result;
};

export const get_song_by_id = async (id) => {
  const result = await get(`api/songs/${id}`);
  return result;
};

export const update_song_data = async (id, data) => {
  const result = await put(`api/songs/edit`, id, data);
  return result;
};

export const delete_song_data = async (id) => {
  const result = await del(`api/songs/delete`, id);
  return result;
};

export const restore_multiple_songs = async (data) => {
  const result = await fetch(`${API_DOMAIN}api/songs/restore-multiple`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  return result;
};

export const delete_multiple_songs = async (data) => {
  const result = await fetch(`${API_DOMAIN}api/songs/delete-multiple`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  return result;
};

export const get_all_pending_songs = async () => {
  const result = await get(`api/songs/get-all-pending-songs`);
  return result;
};

export const get_number_of_top_liked_songs = async (limit) => {
  const result = await get(
    `api/songs/get-number-of-top-liked-songs?limit=${limit}`
  );
  return result;
};

export const get_number_of_top_listened_songs = async (limit) => {
  const result = await get(
    `api/songs/get-number-of-top-play-count-songs?limit=${limit}`
  );
  return result;
};

export const get_songs_by_topic_slug = async (id) => {
  const result = await get(`api/songs/get-songs-by-topic/${id}`);
  return result;
};

export const get_song_by_slug = async (slug) => {
  const result = await get(`api/songs/get-song-by-slug/${slug}`);
  return result;
};

export const like_song = async (slug, userId) => {
  console.log("slug", slug);
  console.log("userId", userId);
  const result = await post(`api/songs/like/${slug}/`, { userId });
  return result;
};

export const increment_song_playCount = async (id) => {
  const result = await post(`api/songs/increment-play-count/${id}/`);
  return result;
};

export const filter_songs = async (data) => {
  let text = "";
  for (let [key, value] of Object.entries(data)) {
    text += key + "=" + value + "&";
  }
  const result = await get(`api/songs/filter?${text}`);
  return result;
};

export const search_songs = async (data) => {
  const result = await get(`api/songs/search?keyword=${data}`);
  return result;
};

export const get_all_available_songs = async () => {
  const result = await get(`api/songs/get-all-available-songs`);
  return result;
};

export const filter_pending_songs = async (data) => {
  let text = "";
  for (let [key, value] of Object.entries(data)) {
    text += key + "=" + value + "&";
  }
  text += "status=pending&";
  const result = await get(`api/songs/filter-pending-songs?${text}`);
  return result;
};

export const approve_multiple_songs = async (data) => {
  const result = await fetch(`${API_DOMAIN}api/songs/approve-multiple-songs`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  return result;
};

export const reject_multiple_songs = async (data) => {
  const result = await fetch(`${API_DOMAIN}api/songs/reject-multiple-songs`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  return result;
};

export const approve_song = async (songId, userId) => {
  const response = await patch(`api/songs/approve-song`, songId, { userId });
  return response;
};

export const reject_song = async (songId, userId) => {
  const response = await patch(`api/songs/reject-song`, songId, { userId });
  return response;
};

export const checkIsSongLikedByCurrentUser = async (songId, userId) => {
  return await get(
    `api/songs/check-song-is-liked-by-user?id=${userId}&songId=${songId}`
  );
};

export const get_song_top_play= async () => {
  const result = await get(`api/songs/top-ten-play`);
  return result;
};

export const update_song_like_view= async (data) => {
  const result = await post(`api/songs/like-song`,data);
  return result;
};
