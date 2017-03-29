function initConfig(config, properties)
{
    for(var k in properties)
        if(config[properties[k]] === undefined || config[properties[k]] === null)
        {
            console.error(' [!] \'' + properties[k] + '\' must be specified in \'sass\' config.');
            return false;
        }
    
    return true;
}

module.exports = function(config) {
    return {
        prodRun: function(config) {
            if(!initConfig(config, ['srcFolder', 'destFolder']))
                return;

            config.exec('node-sass --output-style compressed ' + config.srcFolder + ' -o ' + config.destFolder);
        },
        devRun: function(config) {
            if(!initConfig(config, ['srcFolder', 'destFolder']))
                return;

            config.exec('node-sass ' + config.srcFolder + ' -o ' + config.destFolder);
            config.exec('node-sass -w ' + config.srcFolder + ' -o ' + config.destFolder);
        },
        clean: (config) => {
            if(!initConfig(config, ['destFolder']))
                return;

            config.rmdir(config.destFolder);
        },
        configSample: {
            type: 'sass',
            srcFolder: 'styles',
            destFolder: 'public/styles'
        }
    }
}