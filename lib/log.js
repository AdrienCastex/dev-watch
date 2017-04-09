module.exports = {
    config: {},
    log: text => {
        if(module.exports.config.isVerbose)
            console.log(text)
    },
    error: text => {
        if(module.exports.config.isVerbose)
            console.error(text)
    }
}