import http from '../utils/http';

export function apiHello(params) {
  return http.get('/hello', { params, retry: 2 });
}

export function apiUpload(formData, onProgress) {
  return http.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(e),
  });
}
