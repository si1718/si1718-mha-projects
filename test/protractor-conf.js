exports.config = {
    seleniumAddress: 'http://localhost:9515',
    specs: ['T01-LoadData.js'],
    capabilities: {
        'browserName' : 'phantomjs'
    }
}