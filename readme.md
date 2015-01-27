# Breadboard

Breadboard is a JavaScript library for simulating a circuit on a breadboard, with AC and DC inputs, digital
multimeter, and oscilloscope.

See [the examples here](http://concord-consortium.github.io/breadboard/).

Breadboard was built by [The Concord Consortium](http://concord.org/) for the
[SPARKS Project](http://concord.org/sparks/virtual-electronics/) and the
[Teaching Teamworks Project](http://concord.org/projects/teaching-teamwork).

## Building and Running Locally

### Dependencies

* [Node](http://nodejs.org/) `brew install node`
* [Bower](http://bower.io/) `npm install -g bower`

We use npm to install the developer tools, and bower to manage the javascript libraries:

```
  npm install
  bower install
```

### Building the library

Breadboard uses [Browserify](http://browserify.org/) to build the script and create the sparks.js file.

We build automatically and watch for changes using [Gulp](http://gulpjs.com/). Building the dist/ folder is as simple as

```
  npm start
```

Any changes to the script source, the css, or the examples folder will automatically be rebuilt.

### Testing the breadboard library locally

In order to load the example activities in the /examples folder, you just need to serve the contents of the /breadboard directory using a local server, such as Python's SimpleHTTPServer or Live Server.

[Live Server](https://www.npmjs.com/package/live-server) is a simple static server that will automatically reload pages when it detects changes to the source.

```
  npm install -g live-server
  cd breadboard/dist
  live-server
```

The server runs on port 8080 by default. Open a browser and navigate to

http://localhost:8080/

In combination with Gulp above, this will reload your pages any time any source file is saved.

### Deploying

gh-pages and production releases are based on the contents of the /dist folder.

To deploy to gh-pages, simply run `npm run deploy`.

To deploy to production, run `npm run production`.

Check that the production commit looks right, then tag it:

```
  git tag           # check existing tags
  git tag -a 0.0.1 -m 'release version 0.0.1' production
  git push origin --tags
```

Feel free to force new commits to production if the previous one had errors or you soon discover it was incomplete (and delete the old tag and re-tag).


### Understanding the code

The application is found in src/ and is written in an MVC pattern, and the folders follow suit, except for the circuit components, whose model objects can all be found in /src/circuit.

The models generally define object classes. Most objects (pages, sections, etc) are instances of these classes.

The views generally return a jQuery object representing the view of the particular model object. The parent view is generally responsible for embedding the jQuery object onto the page.

Demo activity JSON files can be found in the /examples folder. This folder is copied into /dist.

The circuit calculations are performed by the Circuit Solver library (https://github.com/concord-consortium/circuit-solver)

## License

Breadboard is Copyright 2015 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.
