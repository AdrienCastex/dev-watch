var watch = require('node-watch'),
    fs = require('fs-extra'),
    logger = require('../log.js');

function initConfig(config, properties)
{
    for(var k in properties)
        if(config[properties[k]] === undefined || config[properties[k]] === null)
        {
            logger.error(' [!] \'' + properties[k] + '\' must be specified in \'sass\' config.');
            return false;
        }
    
    return true;
}

function copy(config, callback)
{
    var e = fs.copySync(config.source, config.destination)
    if(e)
        logger.error(e)
    else
        logger.log(' [o] Copied \'' + config.source + '\' to \'' + config.destination + '\'');
    callback(e);
}

module.exports = function(config) {
    return {
        prodRun: function(config, callback) {
            if(!initConfig(config, ['source', 'destination']))
                return;

            copy(config, callback);
        },
        devRun: function(config, callback) {
            if(!initConfig(config, ['source', 'destination']))
                return;

            var countOut = 0;
            config.watch(config.source, { recursive: true }, function(event, filename) {
                ++countOut;
                setTimeout(function() {
                    if(--countOut > 0)
                        return;
                        
                    copy(config, callback);
                    
                }, 200);
            });
        },
        clean: (config, callback) => {
            callback()
        },
        configSample: {
            type: 'copy',
            source: 'file/or/folder/to/copy',
            destination: 'file/or/folder/of/dest'
        }
    }
}