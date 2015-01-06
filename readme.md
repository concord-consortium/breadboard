# Breadboard

## Building and Running Locally

### Dependencies

* [Node](http://nodejs.org/) `brew install node`
* [Bower](http://bower.io/) `npm install -g bower`
* [Browserify](http://browserify.org/) `npm install -g browserify`

We use bower to manage the javascript libraries.

```
  bower install
```

### Building the library

Breadboard uses [Browserify](http://browserify.org/) to build the script and create the sparks.js file.

After any change to the script files in app, run this command

```
  browserify app/init.js --standalone sparks > sparks.js
```

Your changes should be built into sparks.js

We will soon add an automatic build process using Watchify or Guard.

### Testing the breadboard library locally

In order to load the example activities in the /examples folder, you need to serve the contents of the /breadboard directory using a local server, such as Python's SimpleHTTPServer or Apache.

The easiest way to do this is using python:

```
  cd breadboard
  python -m SimpleHTTPServer
```

The server runs on port 8000 by default. Open a browser and navigate to

http://localhost:8000/examples/


### Understanding the code

The majority of the application can be found in app/. The application is written in an MVC pattern, and the folders follow suit, except for the circuit components, whose model objects can all be found in /app/circuit.

The models generally define object classes. Most objects (pages, sections, etc) are instances of these classes.

The views generally return a jQuery object representing the view of the particular model object. The parent view is generally responsible for embedding the jQuery object onto the page.

Demo activity JSON files can be found in the /activities folder.

The circuit calculations are performed by the Circuit Solver library (https://github.com/concord-consortium/circuit-solver)

## License

Breadboard is Copyright 2015 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.
