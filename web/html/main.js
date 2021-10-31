import {getState, setState, setStateKey, getStateKey} from './state.js';
import {appendElement, clearElement} from './dom.js';

const dom = {
  main: document.querySelector('main'),
  search: document.querySelector('input[type="search"]'),
  back: document.querySelector('#back'),
  complain: document.querySelector('#complain'),
};

async function listFoundPosts(search) {
  const posts = await fetch('/api/posts/'+encodeURIComponent(search))
    .then(res=>res.json());

  listPosts(posts);
}

async function listAllPosts() {
  const posts = await fetch('/api/posts')
    .then(res=>res.json());
  listPosts(posts);
}

async function listPosts(posts) {
  clearElement(dom.main);
  posts.forEach(p=>listPost(p));
}

async function listPost(post, full=false) {
  const postContainer = document.createElement('section');
  postContainer.classList.add('post');
  appendElement(postContainer, 'h2', '📯 ' + post.title);
  appendElement(postContainer, 'p', '⏳ Posted: ' + new Date(post.created).toLocaleString());

  if (!full) appendElement(postContainer, 'a', '👓 read', {href: '?post='+post.id});
  else appendElement(postContainer, 'iframe', '', {src: post.src});

  //postContainer.textContent = JSON.stringify(post, null, 4);

  dom.main.appendChild(postContainer);
}

async function showPost(id) {
  clearElement(dom.main);
  const url = '/api/post/'+encodeURIComponent(id);
  const post = await fetch(url)
    .then(res=>res.ok?res.json():{});

  listPost(post, true);
}

function init() {
  const state = getState();
  dom.search.value = state.search || '';
  if (state.post) showPost(state.post);
  else if (state.search) listFoundPosts(state.search);
  else listAllPosts();
}

init();

dom.search.addEventListener('input', (e)=>{
  const search = dom.search.value;
  setStateKey('search', search);
  init();
});

dom.back.addEventListener('click', (e)=>{
  setState({});
  init();
});

dom.complain.addEventListener('click', (e)=>{
  const conf = confirm('This will notify a moderator to check the page you are on! \nContinue?');
  if (!conf) return;
  const url = window.location.pathname + window.location.search + window.location.hash;
  fetch('/api/complain', {method: 'POST', body: url}).then(res=>{
    if (res.ok) return alert('You complaint was received. A moderator will check it out shortly!');
    alert('There was an issue filing your complaint... Try again later!');
  });
});

console.log('hi')
