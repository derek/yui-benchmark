var suite = new PerfSuite('Gallery test', {
    assets: ['filesystem/path/to/my-gallery-module.js'],
    yui: {
        use: ['my-module'],
        config: {
            modules: {
                'my-module': 'assets/my-gallery-module.js'
            }
        }
    }
});