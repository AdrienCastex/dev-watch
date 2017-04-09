var fs = require('fs-extra'),
    sass = require('node-sass'),
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

module.exports = function(config) {
    return {
        prodRun: function(config) {
            if(!initConfig(config, ['srcFile', 'destFile']))
                return;

            sass.render({
                file: config.srcFile,
                outFile: config.destFile
            }, (e, r) => {
                if(e)
                {
                    logger.error(e);
                    return;
                }

                fs.writeFile(config.destFile, r.css, e => {
                    if(e)
                        logger.error(e);
                    else
                        logger.log(' [o] Compiled ' + config.srcFile + ' to ' + config.destFile);
                });
            })
        },
        devRun: function(config) {
            if(!initConfig(config, ['srcFile', 'srcFolder', 'destFile']))
                return;

            config.watch(config.srcFolder, { recursive: true }, function(event, filename) {
                if(!/\.scss$/.test(filename))
                    return;
                
                sass.render({
                    file: config.srcFile,
                    outFile: config.destFile
                }, (e, r) => {
                    if(e)
                    {
                        logger.error(e);
                        return;
                    }

                    fs.writeFile(config.destFile, r.css, e => {
                        if(e)
                            logger.error(e);
                        else
                            logger.log(' [o] Compiled ' + config.srcFile + ' to ' + config.destFile);
                    });
                })
            });
        },
        clean: (config) => {
            if(!initConfig(config, ['destFile']))
                return;

            fs.unlink(config.destFile);
        },
        configSample: {
            type: 'sass',
            srcFile: 'styles/style.scss',
            srcFolder: 'styles',
            destFile: 'public/styles/style.css'
        }
    }
}