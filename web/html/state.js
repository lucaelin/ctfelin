// This file contains all state mangement functions and utilities

// Serialsize an object into url query/search params, like php does
// So {a:{b:1}, b:'hi'} becomes a[b]=1&b=hi
export function serialize(obj, prefix) {
  var str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
      str.push((v !== null && typeof v === "object") ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}

// Deserialsize an object from url query/search params, like php does
// So a[b]=1&b=hi becomes {a:{b:1}, b:'hi'}
export function deserialize(search) {
  const entries = [...new URLSearchParams(search).entries()];
  const obj = {};
  entries.forEach(([k, v])=>setEntry(obj, k, v));
  return obj;
}

// Converts bracket notation into an array of keys
// bracketToPath('a[b][c]')
//   returns ['a', 'b', 'c']
function breaketToPath(bracket) {
  if (typeof bracket !== 'string') throw new Error('Invalid Type');

  return [
    ...bracket.matchAll(/\[?([^\[\]]*)\]?/g)
  ].map(p=>p[1]).slice(0,-1);
}

// Sets an objects property with a string using bracket notation
// setEntry({a:1}, "b[c]", 1)
//   returns {a:1, b:{c:1}}
// I used eval at first but this should be more secure, right?
function setEntry(obj, entry, value) {
  const path = breaketToPath(entry);

  const leaf = path.pop();
  const target = path.reduce((p, c)=>{
    if (!p[c]) p[c] = {};
    return p[c];
  }, obj);
  target[leaf] = value;
  return obj;
}

// Gets an objects property with a string using bracket notation
// getEntry({a:{b:1}}, "a[b]")
//   returns 1
function getEntry(obj, entry) {
  const path = breaketToPath(entry);

  const leaf = path.pop();
  const target = path.reduce((p, c)=>{
    if (typeof p !== 'object') return;
    return p[c];
  }, obj);
  return target[leaf];
}

// Gets a specific key in bracket notation from the state in the query string
export function getStateKey(key) {
  const state = getState();
  return getEntry(state, key);
}
// Gets the state object from the query string
export function getState() {
  const state = deserialize(window.location.search);
  return state;
}

// Sets a specific key in bracket notation in the query string
export function setStateKey(key, value) {
  const state = getState();
  setEntry(state, key, value);
  setState(state);
}
// Sets the state object in the query string
export function setState(state) {
  const url = new URL(window.location.toString());
  url.search = serialize(state);
  window.history.pushState({}, window.title, url.toString());
}
