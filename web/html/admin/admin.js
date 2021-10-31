import {getState, setState, setStateKey, getStateKey} from '../state.js';
import {appendElement, clearElement} from '../dom.js';
import {uploadFile} from './upload.js';

const dom = {
  main: document.querySelector('main'),
  back: document.querySelector('#back'),
};

async function renderComplaints() {
  appendElement(dom.main, 'h1', 'Complaints 😠');
  const res = await fetch('/api/complaints', {credentials: 'same-origin'}).then(res=>res.json());
  for(const c of res) {
    console.log(c);
    const complaint = appendElement(dom.main, 'div');
    appendElement(complaint, 'h2', '#'+c.id);
    appendElement(complaint, 'iframe', '', {src: c.url});
  }
  if (!res.length) {
    appendElement(dom.main, 'h2', 'It\'s all good 🎉');
  }
}
async function renderNewPost() {
  appendElement(dom.main, 'h1', 'New Post 📯');

  const form = appendElement(dom.main, 'form', '', {action: ''});
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const title = data.get('title');
    const body = data.get('body');
    const res = await fetch('/api/post?title='+encodeURIComponent(title), {
      credentials: 'same-origin',
      method: 'POST',
      body: body,
    });
    if (res.ok) {
      form.reset();
      appendElement(dom.main, 'p', 'Post created!')
    } else {
      document.cookie = "token=;expires=01-01-1900;path=/";
      console.log('Logging out, because of invalid response from server');
      appendElement(dom.main, 'p', 'Post creation failed! Status '+res.status);
    }
  });

  appendElement(form, 'input', '', {type: 'text', name: 'title', placeholder: 'title', required: 'required'});
  appendElement(form, 'textarea', '', {name: 'body', placeholder: 'post', required: 'required'});
  appendElement(form, 'button', 'Publish', {name: 'submit'});
}
async function renderNewFile() {
  appendElement(dom.main, 'h1', 'Upload media');

  const form = appendElement(dom.main, 'form', '', {action: ''});
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const filename = data.get('name');
    const file = data.get('file');
    console.log(file);
    form.reset();
    uploadFile(dom.main, filename, file);
  });
  const nameinput = appendElement(form, 'input', '', {type: 'text', name: 'name', placeholder: 'name'});
  const fileinput = appendElement(form, 'input', '', {type: 'file', name: 'file', placeholder: 'media'});
  fileinput.addEventListener('change', (e)=>{
    nameinput.value = fileinput.files[0]?.name || '';
  });
  appendElement(form, 'button', 'Upload', {name: 'submit'});
}


async function renderLogin() {
  appendElement(dom.main, 'h1', 'Login Required');
  const tokeninput = appendElement(dom.main, 'input', '', {type: 'text', name: 'token', placeholder: 'token'});
  const submit = appendElement(dom.main, 'button', 'Login', {type: 'submit', name: 'submit'});
  submit.addEventListener('click', (e)=>{
    document.cookie = `token=${tokeninput.value};path=/;SameSite=lax`;
    window.location.reload();
  });
}

function init() {
  if (!getStateKey('page')) setStateKey('page', 'dash');
  const page = getStateKey('page');

  if (!document.cookie.includes('token=')) renderLogin();
  else switch (page) {
    case 'newfile':     return renderNewFile();
    case 'complaints':  return renderComplaints();
    case 'newpost':     return renderNewPost();
    default:
      return renderNewPost();
  }
}

init();
