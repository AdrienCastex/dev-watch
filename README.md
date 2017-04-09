# dev-watch
NPM repository for dev-watch - Watch and compile/transform folders/files

## Installation

```
npm install -g dev-watch
```

Add to your JSON configuration file (it can be `package.json`) a property `devWatch` containing an `Object` with the different watchers you want to use.

Here is a sample :

```json
{
  "devWatch": {
    "cmd": "dev",
    "runs": [
      {
        "type": "typescript",
        "tempFolder": "react/bin",
        "rootFile": "root",
        "dest": "public/react.js"
      },
      {
        "type": "sass",
        "srcFolder": "styles",
        "destFolder": "public/styles"
      }
    ]
  }
}
```

The `cmd` property defines the kind of things to do :

Command | Description
-|-
dev | Compile and transform everytime something changes
prod | Compile and transform, then exit
clean | Clean the destination folders/files (might be unsafe)

The `runs` property defines the watchers. Call `dev-watch` to get a list of the watchers and their properties.

## Usage

```
dev-watch <configuration-file-path> [<cmd>]
dev-watch package.json
dev-watch package.json clean
```

## Short road-map

- [ ] Add tar/zlib module
- [ ] Add 'custom' module
- [ ] Add 'text replacer' module
- [ ] Add 'copier' module
