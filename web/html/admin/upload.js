import {appendElement, clearElement} from '../dom.js';
import 'https://unpkg.com/@stardazed/streams-polyfill/dist/sd-streams-polyfill.min.js'

export async function uploadFile(dom, filename, file) {
  const upload = appendElement(dom, 'div', 'Uploading ' + filename + '...');
  const res = await fetch(`/api/upload/${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: {'content-type': file.type},
    body: file.stream(),
    allowHTTP1ForStreamingUpload: true,
  });
  if (res.ok) {
    const href = '/media/'+encodeURIComponent(filename);
    upload.textContent = 'File available at';
    appendElement(upload, 'a', href, {href});
  } else {
    upload.textContent = 'Failed to upload '+filename+': status '+res.status;
  }
  return upload;
}
