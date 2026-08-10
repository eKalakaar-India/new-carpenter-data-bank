import axios from 'axios';
export const uploadImage=(fd)=>axios.post('/api/gallery/upload',fd,{headers:{'Content-Type':'multipart/form-data'}});
export const getImages=(id)=>axios.get(`/api/gallery/${id}`);
export const deleteImage=(id)=>axios.delete(`/api/gallery/${id}`);