import { get, patch, post, put, del } from "../utils/request";
const API_DOMAIN = `http://127.0.0.1:8000/`;

export const get_all_pending_albums = async () => {
  const result = await get(`api/albums/get-all-pending-albums`);
  return result;
};
