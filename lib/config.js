var fs = require('fs'),
    watch = require('node-watch'),
    logger = require('./log.js');

function deleteFolder(path)
{
    if(fs.existsSync(path))
    {
        fs.readdirSync(path).forEach(function(file,index)
        {
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory())
                deleteFolder(curPath);
            else
                fs.unlinkSync(curPath);
        });
        fs.rmdirSync(path);
    }
};

function exec(cmd, callback) {
    var exec = require('child_process').exec;
    exec(cmd, function(error, stdout, stderr) {
        if(error)
            logger.log(error);
        if(stderr)
            logger.log(stderr);
        if(stdout)
            logger.log(stdout);
        if(callback)
            callback(error, stdout, stderr);
    });
}

module.exports = {
    wrap: (config) => {
        config.rmdir = deleteFolder;
        config.exec = exec;
        config.watch = watch;
    },
    load: (configFilePath, cmdArgument, callback) => {
        fs.readFile(configFilePath, (e, content) => {
            var config = e ? null : JSON.parse(content);
            if(!config)
            {
                logger.error(' [!] Can\'t find a configuration file');
                return;
            }
            if(!config.devWatch)
            {
                logger.error(' [!] Can\'t find \'devWatch\' in the configuration file');
                return;
            }
            config = config.devWatch;
            if(!config.cmd)
            {
                if(!cmdArgument)
                {
                    logger.error(' [!] Can\'t find \'cmd\' in the configuration file or as process argument');
                    return;
                }
                config.cmd = cmdArgument;
            }

            module.exports.init(config);

            callback(config);
        })
    },
    init: (config, isVerbose = false) => {
        logger.config = config;

        if(config.isVerbose === undefined || config.isVerbose === null)
            config.isVerbose = true;

        if(!config.cmd)
        {
            if(isVerbose)
                logger.error(' [!] Can\'t find \'cmd\' in the configuration');
            return;
        }

        module.exports.wrap(config);

        function log(text)
        {
            if(isVerbose)
                logger.log(text);
        }
        
        switch(config.cmd)
        {
            case 'clean':
                log(' [i] Clean mode');
                config.cmd = (f, o, config, callback) => {
                    if(config.noClean)
                        return;
                    o.clean(config, callback);
                    log(' [o] cleaned ' + f);
                };
                break;

            case 'dev':
                log(' [i] Development mode');
                config.cmd = (f, o, config, callback) => {
                    if(o.devRun)
                    {
                        o.devRun(config, callback);
                        log(' [o] loaded ' + f);
                    }
                    else if(o.run)
                    {
                        o.run(config, callback);
                        log(' [o] loaded ' + f);
                    }
                }
                break;

            case 'prod':
                log(' [i] Production mode');
                config.cmd = (f, o, config, callback) => {
                    if(o.prodRun)
                    {
                        o.prodRun(config, callback);
                        log(' [o] loaded ' + f);
                    }
                    else if(o.run)
                    {
                        o.run(config, callback);
                        log(' [o] loaded ' + f);
                    }
                }
                break;
            
            default:
                log(' [!] Unkown command ' + config.cmd);
                return;
        }
    }
}