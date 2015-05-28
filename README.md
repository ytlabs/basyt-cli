# basyt-cli
This package enables basyt entities to be used in command line applications. You still need adapter package i.e. `basyt-mongo-collection` to be installed besides basyt-cli.


## Installation

```bash
$ npm install basyt-cli
$ npm install basyt-mongodb-collection
```

## Quick Start

```js
var basytCli = require('basyt-cli'),
    config = require('./config');

var basyt = new basytCli();

// you can access collections over basyt instances collections property.
// for instance, to access 'project' collection
basyt.collections['project'].read({name: 'sample project'}).then( /* ... */ );
```
