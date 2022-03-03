# GrapeTree with GIS integration

Project based on [GrapeTree](https://github.com/achtman-lab/GrapeTree), a fully interactive, tree visualization program within EnteroBase, which supports facile manipulations of both tree layout and metadata. Please see more info [here](https://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html).

## Instruction to run it locally

To see the project locally we need to run a web server, node js works pretty fine.

#### Install node js

Download the latest stable release of NodeJS from https://nodejs.org and install using all the default options.

#### Install npm install -g http-server

Install the http-server globally on your machine using the node package manager (npm) command line tool, this will allow you to run a web server from anywhere on your computer.

Open the terminal and write:

`npm install -g http-server`

#### Start a web server

In terminal open the directory containing your static web files and start the server with the following command:

`http-server`

#### Use live-server

npm install live-server -g

`live-server`

## Source file in place

Make sure following files are in the right directory, according to the url:

```
?tree=/tmp/tree.nwk&metadata=/tmp/metadata.tsv&geo=/tmp/points.geojson
?tree=/tmp/adp/abruzzo/tree.nwk&metadata=/tmp/adp/abruzzo/meta.tsv&geo=/tmp/adp/abruzzo/points.geojson
```

## Dev notes

 To remove the mousewheel behaviour for zoom, add `.on("wheel.zoom", null)` to base_tree.js on line 931 after `.on("dblclick.zoom", null)`. 


