var fs = require('fs'),
    watch = require('node-watch'),
    configLoader = require('./config.js');

exports.execute = function()
{
    if(!process.argv || process.argv.length < 3)
    {
        console.log(' Usage : watch <config-file.json> [<cmd>]');
        console.log('       : <cmd> = clean | dev | prod');
        console.log(' Configuration samples :');
        var watchers = exports.defaultWatchers();
        for(var k in watchers)
        {
            console.log(' # ' + k);
            console.log(JSON.stringify(watchers[k].configSample, null, 2));
        }
        return;
    }
    var configFilePath = process.argv[2];
    configLoader.load(configFilePath, process.argv[3], function(config) {
        exports.run(config);
    });
}

exports.defaultWatchers = function(config) {
    return {
        'copy': require('./modules/copy.js')(config),
        'typescript': require('./modules/typescript.js')(config),
        'sass': require('./modules/sass.js')(config),
        'svg-extract-layers': require('./modules/svg-extract-layers.js')(config)
    }
}

exports.run = function(config, watchers, callback)
{
    configLoader.init(config, false)

    if(watchers === undefined)
        watchers = exports.defaultWatchers(config);
    
    var countOut = 0;
    function callbackOut()
    {
        --countOut
        if(countOut === 0)
            callback()
    }

    function exe(obj, meta, _config) {
        _config = _config ? _config : config;
        configLoader.wrap(_config);
        config.cmd(meta ? meta : obj.name, obj, _config, callbackOut);
    }

    var execs = []

    if(config.runs)
    {
        config.runs.forEach(run => {
            var type = run.type;
            var runObj = watchers[type];
            if(!runObj)
                console.error(' [!] \'' + type + '\' is not a known module/watcher');
            else
            {
                execs.push(() => exe(runObj, run.type, run))
                console.log(' [o] Run of ' + type + '');
            }
        })
    }
    else
        console.log(' [?] No \'runs\' in the configuration file');
    
    fs.readdir('./watchers', function(err, files)
    {
        if(err) return;

        files.forEach(function(file) {
            var name = './watchers/' + file;
            execs.push(() => exe(require(name), file));
        });
    });

    countOut = execs.length
    for(var k in execs)
        execs[k]()
}
