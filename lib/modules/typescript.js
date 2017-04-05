var watch = require('node-watch');

function initConfig(config) {
    config.declarations = config.declarations !== undefined ? config.declarations : false;
    config.configFile = config.configFile ? config.configFile : 'package.json';
    config.tempFolder = config.tempFolder ? config.tempFolder : 'dist';
    config.browserify = config.browserify !== undefined ? config.browserify : true;
    config.rootFile = config.rootFile ? config.rootFile : 'boot';
    config.dest = config.dest ? config.dest : 'script.js';
}

function createCommand(config) {
    var cmd = 'tsc --p "' + config.configFile + '"';

    if(config.declarations)
        cmd += ' --declaration';

    return cmd;
}

module.exports = function(config) {
    return {
        prodRun: function(config) {
            initConfig(config);

            config.exec(createCommand(config), () => {
                if(!config.browserify)
                    return;
                
                var srcFile = config.tempFolder + '/' + config.rootFile + '.js';
                console.log(' [ ] ' + config.dest + ' updating from ' + srcFile);
                config.exec('browserify -s main ' + srcFile + ' -o ' + config.dest, () => {
                    console.log(' [o] ' + config.dest + ' updated');
                });
            });
        },
        devRun: function(config) {
            initConfig(config);

            config.exec(createCommand(config) + ' --watch');
            
            if(!config.browserify)
                return;

            var countOut = 0;
            config.watch(config.tempFolder, { recursive: true }, function(event, filename) {
                ++countOut;
                setTimeout(function() {
                    if(--countOut > 0)
                        return;
                    var srcFile = config.tempFolder + '/' + config.rootFile + '.js';
                    console.log(' [o] ' + filename + ' updated');
                    console.log(' [ ] compiling ' + srcFile + ' to ' + config.dest);
                    config.exec('browserify -s main ' + srcFile + ' -o ' + config.dest, () => {
                        console.log(' [o] ' + config.dest + ' updated');
                    });
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
            declarations : false
        }
    }
}