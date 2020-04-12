# Lamb's Light Source
This document contains instructions for building Lamb's Light, and a high level description of the `src` directory.

# Building Source
Before running the commands below, you need to install Git and TypeScript.

```
$ git clone https://github.com/cloudsickle/lambslight.git
$ cd lambslight/src/ts
$ tsc
$ cd ..
$ python -m http.server
```

You can host a simple web server with something other than Python. After hosting the server, open your browser and go to http://0.0.0.0:8000/ or whatever your local server address is.

## Directory Organization
The `src` directory contains the HTML and CSS file to create the website, as well as the `ts` and `assets` directories. All TypeScript files are located in the `ts` directory. These are then compiled into a `js` directory also directly under `src`. Game assets are stored in the `assets` directory. This organization makes it such that no paths have to be changed in TypeScript files after they are compiled to JavaScript.
