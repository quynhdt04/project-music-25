import { get, patch, post, put, del } from "../utils/request";
const API_DOMAIN = `http://127.0.0.1:8000/`;

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
  return result;
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
  return result;
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
  return result;
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
  return result;
};
