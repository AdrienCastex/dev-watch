var devWatch = require('../lib/dev-watch'),
    fs = require('fs-extra'),
    exec = require('child_process').exec;


function test(name, fn)
{
    try
    {
        fn(valid => {
            if(valid)
                console.log(' [o] ' + name + ' successed!')
            else
                console.error(' [!] ' + name + ' failed!')
        })
    }
    catch(ex)
    {
        console.error(' [!] ' + name + ' failed!')
    }
}

test('copy', (cb) => {
    fs.removeSync('copy/dest')

    devWatch.run({
        cmd: 'prod',
        isVerbose: false,
        runs: [
            {
                type: 'copy',
                source: 'copy/src',
                destination: 'copy/dest'
            }
        ]
    }, undefined, () => {
        cb(
            fs.readFileSync('copy/src/t1.txt').toString() === fs.readFileSync('copy/dest/t1.txt').toString() &&
            fs.readFileSync('copy/src/t2.txt').toString() === fs.readFileSync('copy/dest/t2.txt').toString()
        )
    })
})

test('typescript', (cb) => {
    fs.removeSync('typescript/dest')
    fs.removeSync('typescript/dest2')

    devWatch.run({
        cmd: 'prod',
        isVerbose: false,
        runs: [
            {
                type: 'typescript',
                tempFolder: 'typescript/dest',
                rootFile: 'index',
                dest: 'typescript/dest2/final.js',
                browserify: true,
                declarations : false,
                configFile: 'typescript/tsconfig.json'
            }
        ]
    }, undefined, (e) => {
        if(!!e)
            cb(false)
        else
            exec('node typescript/dest/index.js', (e, so) => {
                if(so)
                    so = so.trim()
                cb(!e && so === 'ok')
            })
    })
})


