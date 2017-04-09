var watch = require('node-watch'),
    fs = require('fs-extra'),
    browserify = require('browserify');

function initConfig(config) {
    config.declarations = config.declarations !== undefined ? config.declarations : false;
    config.configFile = config.configFile ? config.configFile : 'package.json';
    config.tempFolder = config.tempFolder ? config.tempFolder : 'dist';
    config.browserify = config.browserify !== undefined ? config.browserify : true;
    config.rootFile = config.rootFile ? config.rootFile : 'boot';
    config.options = config.options ? config.options : {};
    config.files = config.files ? config.files : [];
    config.dest = config.dest ? config.dest : 'script.js';
}

function createCommand(config) {
    var cmd = 'tsc';

    if(config.declarations)
        cmd += ' --declaration';
    
    var keys = Object.keys(config.options);
    for(var k in keys)
    {
        cmd += ' --' + keys[k];
        var value = config.options[keys[k]];
        if(value !== null)
            cmd += ' "' + value.toString() + '"';
    }

    if(config.files.length > 0)
        for(var k in config.files)
            cmd += ' "' + config.files[k] + '"';
    else
        cmd += ' --p "' + config.configFile + '"';

    return cmd;
}

function runBrowserify(src, dest, callback)
{
    if(!callback)
        callback = () => {
            if(config.isVerbose)
                console.log(' [o] ' + dest + ' updated')
        };

    var stream = fs.createWriteStream(dest);
    var srcStream = browserify({ standalone: 'main' }).add(src).bundle();
    srcStream.on('end', callback);
    srcStream.pipe(stream);
}


module.exports = function(config) {
    return {
        prodRun: function(config) {
            initConfig(config);

            config.exec(createCommand(config), () => {
                if(!config.browserify)
                    return;
                
                fs.ensureDir(config.tempFolder)

                var srcFile = config.tempFolder + '/' + config.rootFile + '.js';
                if(config.isVerbose)
                    console.log(' [ ] ' + config.dest + ' updating from ' + srcFile);

                runBrowserify(srcFile, config.dest);
            });
        },
        devRun: function(config) {
            initConfig(config);

            config.exec(createCommand(config) + ' --watch');
            
            if(!config.browserify)
                return;
            
            fs.ensureDir(config.tempFolder)

            var countOut = 0;
            config.watch(config.tempFolder, { recursive: true }, function(event, filename) {
                ++countOut;
                setTimeout(function() {
                    if(--countOut > 0)
                        return;
                    var srcFile = config.tempFolder + '/' + config.rootFile + '.js';
                    if(config.isVerbose)
                    {
                        console.log(' [o] ' + filename + ' updated');
                        console.log(' [ ] compiling ' + srcFile + ' to ' + config.dest);
                    }
                    runBrowserify(srcFile, config.dest);
                    
                }, 200);
            });
        },
        clean: (config) => {
            initConfig(config);
            config.rmdir(config.tempFolder);
        },
        configSample: {
            type: 'typescript',
            tempFolder: 'react/bin',
            rootFile: 'root',
            dest: 'public/react.js',
            browserify: true,
            declarations : false,
            options: {
                outDir: "..."
            },
            files: [ '...' ]
        }
    }
}