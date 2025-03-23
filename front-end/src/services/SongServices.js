import { get, patch, post, put, del } from "../utils/request";
const API_DOMAIN = `http://127.0.0.1:8000/`;

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
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  return result;
};
