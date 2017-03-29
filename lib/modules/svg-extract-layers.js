var fs = require('fs'),
    watch = require('node-watch');

function initConfig(config, properties)
{
    for(var k in properties)
        if(config[properties[k]] === undefined || config[properties[k]] === null)
        {
            console.error(' [!] \'' + properties[k] + '\' must be specified in \'svg-extract-layers\' config.');
            return false;
        }
    
    return true;
}

module.exports = function(config) {
    return {
        devRun: function(config) {
            if(!initConfig(config, ['srcFolder', 'destFolder']))
                return;

            var path = config.srcFolder;
            var folderDest = config.destFolder;

            watch(path, { recursive: false }, function(filename) {
                if(!/\.svg$/.test(filename))
                    return;
                if(!fs.existsSync(filename))
                    return;
                
                console.log(' [ ] extracting ' + filename);
                
                if(!fs.existsSync(folderDest))
                    fs.mkdirSync(folderDest);

                var content = fs.readFileSync(filename);
                var wrapper = fs.readFileSync(path + '/wrapper');

                var offset = 0;
                var index;
                while((index = content.indexOf('inkscape:groupmode="layer"', offset)) > -1)
                {
                    offset = index + 1;

                    var start = content.lastIndexOf('<', index);
                    var end = content.indexOf('>', index);
                    var fullEnd = content.indexOf('inkscape:groupmode="layer"', index + 1);
                    if(fullEnd == -1)
                        fullEnd = content.length;
                    fullEnd = content.lastIndexOf('</g>', fullEnd) + 4;

                    var tag = content.toString('UTF-8', start, end);
                    var full = content.toString('UTF-8', start, fullEnd);
                    full = full.replace(/display( )*:( )*none/img, '');

                    var name = /inkscape:label="([^"]+)"/i.exec(tag)[1];

                    full = full.replace(/id="([a-z0-9]+)"/i, 'id="' + name + '"');

                    var finalFile = wrapper.toString().replace('{{content}}', full);
                    fs.writeFileSync(folderDest + '/' + name + '.svg', finalFile);
                }
                console.log(' [o] extracted ' + filename);
            });
        },
        clean: (config) => {
            if(!initConfig(config, ['destFolder']))
                return;

            config.rmdir(config.destFolder);
        },
        configSample: {
            type: 'svg-extract-layers',
            srcFolder: 'icons',
            destFolder: 'public/icons/compiled'
        }
    }
}