import { get, patch, post, put, del } from "../utils/request";
// const API_DOMAIN = `http://127.0.0.1:8000/`;
const API_DOMAIN = import.meta.env.VITE_API_BASE_URL;

export const get_all_pending_albums = async () => {
  const result = await get(`api/albums/get-all-pending-albums`);
  return result;
};

export const get_latest_album = async () => {
  const result = await get(`api/albums/get-latest-album`);
  return result;
};

export const get_all_albums = async () => {
  const result = await get(`api/albums/get-all-albums`);
  return result;
};

export const create_album = async (data) => {
  const result = await post(`api/albums/create-album`, data);
  return result;
};

export const update_album = async (id, data) => {
  const result = await put(`api/albums/update-album`, id, data);
  return result;
};

export const get_album_by_id = async (id) => {
  const result = await get(`api/albums/get-album-by-id/${id}/`);
  return result;
};

export const delete_album_data = async (id) => {
  const result = patch(`api/albums/delete-album`, id);
  return result;
};

export const restore_multiple_albums = async (data) => {
  const result = await fetch(
    `${API_DOMAIN}api/albums/restore-multiple-albums`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify(data),
    }
  );
  return await result.json();
};

export const delete_multiple_albums = async (data) => {
  const result = await fetch(`${API_DOMAIN}api/albums/delete-multiple-albums`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  return await result.json();
};

export const search_albums = async (data) => {
  const result = await get(`api/albums/search?keyword=${data}`);
  return result;
};

export const filter_albums = async (data) => {
  let text = "";
  for (let [key, value] of Object.entries(data)) {
    text += key + "=" + value + "&";
  }
  const result = await get(`api/albums/filter?${text}`);
  return result;
};

export const approve_multiple_albums = async (data) => {
  const result = await fetch(
    `${API_DOMAIN}api/albums/approve-multiple-albums`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify(data),
    }
  );
  return await result.json();
};

export const reject_multiple_albums = async (data) => {
  const result = await fetch(`${API_DOMAIN}api/albums/reject-multiple-albums`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  return await result.json();
};

export const approve_album = async (albumId, userId) => {
  const result = await patch(`api/albums/approve-album`, albumId, { userId });
  return result;
};

export const reject_album = async (albumId, userId) => {
  const result = await patch(`api/albums/reject-album`, albumId, { userId });
  return result;
};

export const get_number_of_albums = async (limit) => {
  const result = await get(`api/albums/get-number-of-albums?limit=${limit}`);
  return result;
};

export const get_songs_by_album_slug = async (slug) => {
  const result = await get(`api/albums/get-songs-by-album/${slug}/`);
  return result;
};

export const get_album_by_slug = async (slug) => {
  const result = await get(`api/albums/get-album-by-slug/${slug}/`);
  return result;
};
