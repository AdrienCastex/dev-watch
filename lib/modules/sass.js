module.exports = function(config) {
    return {
        prodRun: function(config) {
            if(!config.srcFolder)
            {
                console.error(' [!] \'srcFolder\' must be specified in \'sass\' config.');
                return;
            }
            if(!config.destFolder)
            {
                console.error(' [!] \'destFolder\' must be specified in \'sass\' config.');
                return;
            }
            config.exec('node-sass --output-style compressed ' + config.srcFolder + ' -o ' + config.destFolder);
        },
        devRun: function(config) {
            if(!config.srcFolder)
            {
                console.error(' [!] \'srcFolder\' must be specified in \'sass\' config.');
                return;
            }
            if(!config.destFolder)
            {
                console.error(' [!] \'destFolder\' must be specified in \'sass\' config.');
                return;
            }
            config.exec('node-sass ' + config.srcFolder + ' -o ' + config.destFolder);
            config.exec('node-sass -w ' + config.srcFolder + ' -o ' + config.destFolder);
        },
        clean: (config) => {
            if(!config.destFolder)
            {
                console.error(' [!] \'destFolder\' must be specified in \'sass\' config.');
                return;
            }
            config.rmdir(config.destFolder);
        },
        configSample: {
            type: 'sass',
            srcFolder: 'styles',
            destFolder: 'public/styles'
        }
    }
}