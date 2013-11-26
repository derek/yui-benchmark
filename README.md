[![Build Status](https://travis-ci.org/derek/yui-benchmark.png)](https://travis-ci.org/derek/yui-benchmark)

# YUI Benchmark

A toolkit to simplify JavaScript performance testing.

## Installing

	npm install -g yui-benchmark

## Using YUI Benchmark

Here's an example using a simple JavaScript test to compare performance of Array creation.

	$ yb examples/vanilla.js
	When ready, press Enter to begin testing.
	Waiting for agents to connect at http://192.168.72.145:3000
	...also available locally at http://127.0.0.1:3000
	info: Agent connect: Firefox (28.0) / Mac OS from 127.0.0.1
	info: Agent connect: Chrome (31.0.1650.57) / Mac OS from 127.0.0.1

Now point your browser(s) to `http://localhost:3000`, hit `Enter` in your terminal, and YUI Benchmark will take care of the rest!

	Executing tests...
	info: Got result from Chrome (31.0.1650.57) / Mac OS
	info: Got result from Firefox (28.0) / Mac OS

![Test results](http://i.imgur.com/2UwvHmp.png)

### Automated Web Testing
Automated testing is great for quick results or in CI environments (such as [Travis CI](https://travis-ci.org/)).  Once you have [Phantom.js](http://phantomjs.org/) installed, you can execute tests with the `--phantom` option for completely automated testing.

For example, here's an asynchronous test that uses `setTimeout` to delay resolution:

	$ yb examples/async.js --phantom
	info: Agent connect: PhantomJS (1.9.2) / Mac OS from 127.0.0.1
	Executing tests ...
	info: Got result from PhantomJS (1.9.2) / Mac OS

![Test results](http://i.imgur.com/PdslUp2.png)

### Node.js Testing
YUI Benchmark isn't just for web-based testing, it can also compile your test into a Node.js script.  This can be toggled by using the `--node` CLI flag.

For example, here's a test that will compare Node's `path.resolve` to `path.join`:

	$ yb examples/node.js --node
	Executing tests ...

![Test results](http://i.imgur.com/wALA8LW.png)

## YUI Testing
YUI Benchmark was written as a general purpose JavaScript benchmarking toolkit, but as you can imagine, it has special capabilities included for use with YUI testing.

### Multi-version YUI Testing
By default, YUI Benchmark will only test your "working" tree, but it is designed to do so much more!  Namely, to help you out with multi-version testing.  For instance, if you write a test and want to know how performance has improved over time, YUI Benchmark can help you out here, simply specify additional [Git refs](http://git-scm.com/book/en/Git-Internals-Git-References) via the `--ref` option.  For each additional ref, YUI Benchmark will clone your repo to a temporary path, rebuild YUI (if neccesary), and cache it in a `.builds` directory in your YUI repository path.

For example, if we wanted to see how much faster `app-model.js` was between YUI v3.9.0 and v3.12.0, and skip our working code...

	$ yb src/app/tests/performance/app-model.js --phantom --ref v3.9.0 --ref v3.12.0 --no-working
	info: v3.9.0: Creating seed. This could take a few minutes.
	info: v3.12.0: Creating seed. This could take a few minutes.
	Waiting for agents to connect at http://10.73.200.144:3000
	...also available locally at http://127.0.0.1:3000
	  Agent connect: PhantomJS (1.9.1) / Mac OS from 127.0.0.1
	Executing tests...
	Got result from PhantomJS (1.9.1) / Mac OS
	Got result from PhantomJS (1.9.1) / Mac OS

![Test results](http://i.imgur.com/WmEBd9R.png)

And in `.builds` you'll find two versioned build directories, cached for any subsequent tests.

	$ ls -1 .builds
	v3.12.0-8655935bc2c668f3ee3d93db7709446169aa08b3
	v3.9.0-b7d710018c74a268ce8a333a3e7b77c6db349062

## Additional CLI Options

* `--iterations=<integer>` - The number of times to execute each test suite. Results will be averaged. *Default: `1`*
* `--loglevel=<string>` - `info`, `debug`, `verbose`, or `silent`.  *Default: `info`* Shorthands: `--debug`, `--verbose`, `--silent`.
* `--node=<boolean>` - If this is a Node.js test (instead of Web). *Default: `false`*
* `--phantom=<boolean>` - Use Phantom.js as your test browser. *Default: `false`*
* `--port=<integer>` - The HTTP port to listen on. *Default: `3000`*
* `--raw=<path>` - A path to dump the raw JSON
* `--ref=<string>` - Which ref(s) of the YUI repository you'd like to execute the performance test against. Specify as many as you'd like (each with its own `--ref`).
* `--yui-repo=<path>` - Path to your local YUI repository.
* `--tmp=<path>` - A path where temporary files can be stored. *Default: OS assigned*
* `--timeout=<integer>` - How long to wait (in seconds) before aborting this process. *Default: `300`*
* `--working=<boolean>` - Whether or not to include your working tree as a test ref. *Default: `true`* Shorthands: `--no-working`.

## Performance Tests

Test files simply contain the ingredients for a performance test suite, and little more.

For example, here's the source file we were using in the async example:

	var suite = new PerfSuite('Async tests', {
	    tests: [{
	        name: 'Half second timout',
	        async: true,
	        fn: function (deferred) {
	            setTimeout(function() {
	                deferred.resolve();
	            }, 500);
	        }
	    },{
	        name: 'One second timeout',
	        async: true,
	        fn: function (deferred) {
	            setTimeout(function() {
	                deferred.resolve();
	            }, 1000);
	        }
	    }]
	});


To get a better idea, check out some more examples in the YUI source tree

 * [app](https://github.com/yui/yui3/tree/master/src/app/tests/performance/)
 * [base](https://github.com/yui/yui3/tree/master/src/base/tests/performance/)
 * [node](https://github.com/yui/yui3/tree/master/src/node/tests/performance/)
 * [promise](https://github.com/yui/yui3/tree/master/src/promise/tests/performance/promise.js)

Or in yui-benchmark's [examples directory](examples).

### PerfSuites
Suites are objects that contain the following properties:

**Required**

 * `name` - The name of this suite.
 * `tests` - An array of "test" objects.

**Optional**

 * `global` - An object containing `setup` and/or `teardown` functions to be run before/after any tests in the suite.
 * `slug` - A short-name for this suite. Used for URLs and filenames.
 * `html` - A string or relative path on your filesystem to some HTML to be placed inside the `body` tag.
 * `jquery` - A boolean. Defaults to `false`.
 * `yui`
    * `config` - A YUI config object.
    * `use` - An array of modules to include in your suite.
 * `dojo`
 	* `require` - An array of modules to include in your test.
 	* `exportAs` - An array of names your `require` values should be exported as.

### Tests
Tests are objects that contain the following properties:

**Required**

 * `name` - The name of this test.
 * `fn` - The function to test.

**Optional**

 * `async` - If this test should be considered an async test. If `true`, your test function will recieve a callback as the first argument. Execute it when your test is complete.
 * `setup` - A function to execute before the test cycle. This will override anything specified in `global.setup`.
 * `teardown` - A function to execute after the test cycle. This will override anything specified in `global.teardown`.

Note: Both `setup` and `teardown` share a scope with `fn`.  These methods are useful to instantiate any new variables/objects/classes for each cycle, and clean them up outside of the measured test loop.

## Additional Tools
In addition to `yb`, you'll have a few extra tools that may be helpful:

 * `yb-clean` - Removes any `yui3-*` repo directories in your OS's temp directory, as well as `.builds` from your current directory.
 * `yb-compile` - Compiles a config file to an executable performance test (e.g. `yb-compile path/to/source.js`).  After execution, open the generated HTML file in a browser and take a look at the console for results.
 * `yb-parse` - Converts a raw JSON results file to pretty tables (e.g. `cat myResults.json | yb-parse`). Also, this provides a nice starting point if you want to make your own parser.

## YUI - Yogi
Additionally, you can test performance via [Yogi](https://github.com/yui/yogi) by
installing the [yogi-perf plugin](https://github.com/derek/yogi-perf) via `npm install -g yogi-perf`.
Once installed, run `$ yogi perf` from within your component's directory, and Yogi will execute any
tests found in `tests/performance/`. If executed from the root level of the `yui3` repository,
all performance tests in the library will be executed.

### CLI Options
The following options are relayed from `yogi perf` to `yb`:

* `--loglevel`
* `--ref`
* `--timeout`
* `--tmp`
* `--working`

The following options are also supported and specific to `yogi perf`:

* `--outdir` - Where `--raw` files can be dumped.
* `--component` - A specific component to test.

## License
YUI Benchmark is open-sourced with a BSD license.  See [LICENSE.md](LICENSE.md).
