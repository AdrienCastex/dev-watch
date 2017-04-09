var watch = require('node-watch'),
    fs = require('fs-extra');

function initConfig(config, properties)
{
    for(var k in properties)
        if(config[properties[k]] === undefined || config[properties[k]] === null)
        {
            if(config.isVerbose)
                console.error(' [!] \'' + properties[k] + '\' must be specified in \'sass\' config.');
            return false;
        }
    
    return true;
}

function copy(config)
{
    fs.copy(config.source, config.destination, e => {
        if(config.isVerbose)
            if(e)
                console.error(e)
            else
                console.log(' [o] Copied \'' + config.source + '\' to \'' + config.destination + '\'');
    })
}

module.exports = function(config) {
    return {
        prodRun: function(config) {
            if(!initConfig(config, ['source', 'destination']))
                return;

            copy(config);
        },
        devRun: function(config) {
            if(!initConfig(config, ['source', 'destination']))
                return;

            var countOut = 0;
            config.watch(config.source, { recursive: true }, function(event, filename) {
                ++countOut;
                setTimeout(function() {
                    if(--countOut > 0)
                        return;
                        
                    copy(config);
                    
                }, 200);
            });
        },
        clean: (config) => {
        },
        configSample: {
            type: 'copy',
            source: 'file/or/folder/to/copy',
            destination: 'file/or/folder/of/dest'
        }
    }
}