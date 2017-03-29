var watch = require('node-watch');

function initConfig(config) {
    config.configFile = config.configFile ? config.configFile : 'package.json';
    config.tempFolder = config.tempFolder ? config.tempFolder : 'dist';
    config.browserify = config.browserify ? config.browserify : true;
    config.rootFile = config.rootFile ? config.rootFile : 'boot';
    config.dest = config.dest ? config.dest : 'script.js';
}

module.exports = function(config) {
    return {
        prodRun: function(config) {
            initConfig(config);

            config.exec('tsc --p ' + config.configFile + ' --watch', () => {
                var srcFile = config.tempFolder + '/' + config.rootFile + '.js';
                console.log(' [ ] ' + config.dest + ' updating from ' + srcFile);
                config.exec('browserify -s main ' + srcFile + ' -o ' + config.dest, () => {
                    console.log(' [o] ' + config.dest + ' updated');
                });
            });
        },
        devRun: function(config) {
            initConfig(config);

            config.exec('tsc --p ' + config.configFile + ' --watch');

            if(!config.browserify)
                return;

            var countOut = 0;
            config.watch(config.tempFolder, { recursive: true }, function(event, filename) {
                ++countOut;
                setTimeout(function() {
                    if(--countOut > 0)
                        return;
                    var srcFile = config.tempFolder + '/' + config.rootFile + '.js';
                    console.log(' [ ] ' + config.dest + ' updating from ' + srcFile);
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
            browserify: true
        }
    }
}