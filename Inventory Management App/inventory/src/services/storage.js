import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase.js';

export async function uploadImage(file, path) {
  const r = ref(storage, path);
  const res = await uploadBytes(r, file);
  return await getDownloadURL(res.ref);
}
