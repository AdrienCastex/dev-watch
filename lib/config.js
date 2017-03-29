var fs = require('fs'),
    watch = require('node-watch');

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
            console.log(error);
        if(stderr)
            console.log(stderr);
        if(stdout)
            console.log(stdout);
        if(callback)
            callback();
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
                console.error(' [!] Can\'t find a configuration file');
                return;
            }
            if(!config.devWatch)
            {
                console.error(' [!] Can\'t find \'devWatch\' in the configuration file');
                return;
            }
            config = config.devWatch;
            if(!config.cmd)
            {
                if(!cmdArgument)
                {
                    console.error(' [!] Can\'t find \'cmd\' in the configuration file or as process argument');
                    return;
                }
                config.cmd = cmdArgument;
            }

            module.exports.wrap(config);
            
            switch(config.cmd)
            {
                case 'clean':
                    console.log(' [i] Clean mode');
                    config.cmd = (f, o, config) => {
                        if(config.noClean)
                            return;
                        o.clean(config);
                        console.log(' [o] cleaned ' + f);
                    };
                    break;

                case 'dev':
                    console.log(' [i] Development mode');
                    config.cmd = (f, o, config) => {
                        if(o.devRun)
                        {
                            o.devRun(config);
                            console.log(' [o] loaded ' + f);
                        }
                        else if(o.run)
                        {
                            o.run(config);
                            console.log(' [o] loaded ' + f);
                        }
                    }
                    break;

                case 'prod':
                    console.log(' [i] Production mode');
                    config.cmd = (f, o, config) => {
                        if(o.prodRun)
                        {
                            o.prodRun(config);
                            console.log(' [o] loaded ' + f);
                        }
                        else if(o.run)
                        {
                            o.run(config);
                            console.log(' [o] loaded ' + f);
                        }
                    }
                    break;
                
                default:
                    console.log(' [!] Unkown command ' + config.cmd);
                    return;
            }

            callback(config);
        })
    }
}