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

exports.run = function(config, watchers)
{
    if(watchers === undefined)
        watchers = exports.defaultWatchers(config);

    function exe(obj, meta, _config) {
        _config = _config ? _config : config;
        configLoader.wrap(_config);
        config.cmd(meta ? meta : obj.name, obj, _config);
    }

    if(config.runs)
    {
        config.runs.forEach(run => {
            var type = run.type;
            var runObj = watchers[type];
            if(!runObj)
                console.error(' [!] Can\'t load \'' + type + '\'');
            else
            {
                exe(runObj, run.type, run);
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
            exe(require(name), file);
        });
    });
}
