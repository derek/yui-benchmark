# YUI Benchmark

Performance testing made easy

## Features
 * Automated cross-browser testing (via [Yeti](http://yeti.cx/)).
 * Easily run performance tests against any version, tag, branch, or commit of YUI.
 * Don't worry about writing any boiler-plate code for performance testing. We'll take care of that for you.
 * Thanks to [PhantomJS](http://phantomjs.org/), it runs great as an automated task and in CI environments.

## Installing

	git clone git@git.corp.yahoo.com:drg/yui-benchmark.git
	cd yui-benchmark
	sudo npm install -g

*NPM packages coming soon*

## Using YUI Benchmark

Here's an example from  within the `yui3` repository:

	$ cd ./yui3/src/app/tests/performance
	$ yb app-view.js
	info: Compiling "Y.View performance tests" (contains 2 tests) for 1 refs (Working)
	info: Listening at http://127.0.0.1:3000

Now point your browser to `http://127.0.0.1:3000` and we'll take care of the rest!

Or, execute with the `--phantom` option for completely automated testing.

	$ yb app-view.js --phantom
	info: Compiling "Y.View performance tests" (contains 2 tests) for 1 refs (Working)
	info: Listening at http://127.0.0.1:3000
	info: Executing with PhantomJS
	info: Agent connect: PhantomJS (1.9.1) / Mac OS from 127.0.0.1
	info: Got result for task 0 from PhantomJS (1.9.1) / Mac OS

	### Y.View: Instantiate a bare view
		┌───────────┬──────────────────────────────┐
		│           │  PhantomJS (1.9.1) / Mac OS  │
		├───────────┼──────────────────────────────┤
		│  Working  │  28.996k  ±0.7%              │
		└───────────┴──────────────────────────────┘

	### Y.View: Instantiate and subclass a bare view
		┌───────────┬──────────────────────────────┐
		│           │  PhantomJS (1.9.1) / Mac OS  │
		├───────────┼──────────────────────────────┤
		│  Working  │  15.065k  ±0.6%              │
		└───────────┴──────────────────────────────┘

### CLI Options

* `--loglevel=<string>` - `info`, `debug`, `verbose`, or `silent`.  *Default: `info`* Shorthands: `--debug`, `--verbose`, `--silent`.
* `--phantom=<boolean>` - Use Phantom.js as your test browser. *Default: `false`*
* `--port=<integer>` - The HTTP port to listen on. *Default: `3000`*
* `--raw=<path>` - A path to dump the raw JSON
* `--ref=<string>` - Which ref(s) of the YUI repository you'd like to execute the performance test against. Specify as many as you'd like (each with its own `--ref`).
* `--repo=<path>` - Path to your local YUI repository. If unspecified, it assumes you are inside the repository.
* `--tmp=<path>` - A path where temporary files can be stored. *Default: OS assigned*
* `--timeout=<integer>` - How long to wait (in seconds) before aborting this process. *Default: `300`*
* `--working=<boolean>` - Whether or not to include your working tree as a test ref. *Default: `true`* Shorthands: `--no-working`.

## Performance Tests

Test files contain all the ingredients for a performance test suite, and little more.

For example, here's the source file we were using in the above examples:

	var suite = new PerfSuite('Y.View performance tests', {
	    yui: {
	        use: ['app']
	    }
	});

	suite.add({
	    'Y.View: Instantiate a bare view': function () {
	        var view = new Y.View();
	    },
	    'Y.View: Instantiate and subclass a bare view': function () {
	        var MyView = Y.Base.create('myView', Y.View, []),
	            view = new MyView();
	    }
	});

To get a better idea, check out some more examples in the YUI source tree

 * [base](https://github.com/derek/yui3/blob/new-perf/src/base/tests/performance/)
 * [node](https://github.com/derek/yui3/blob/new-perf/src/node/tests/performance/)
 * [promise](https://github.com/derek/yui3/blob/new-perf/src/promise/tests/performance/promise.js)

### Suites
Suites are objects that contain the following properties:

**Required**

 * `name` - The name of this suite.
 * `tests` - An array of "test" objects.

**Optional**

 * `global` - An object containing `setup` and/or `teardown` functions to be run before/after any tests in the suite.
 * `slug` - A short-name for this suite. Used for URLs and filenames.
 * `html` - A string or relative path on your filesystem to some HTML to be placed inside the `body` tag.
 * `yui`
    * `config` - A YUI config object
    * `use` - An array of modules to include in your suite

### Tests
Tests are objects that contain the following properties:

**Required**

 * `name` - The name of this test.
 * `fn` - The function to test.

**Optional**

 * `async` - If this test should be considered an async test. If `true`, your test function will recieve a callback as the first argument. Execute that when your test is complete.
 * `setup` - A function to execute before the test cycle. This will override anything specified in `global.setup`.
 * `teardown` - A function to execute after the test cycle. This will override anything specified in `global.teardown`.

Note: Both `setup` and `teardown` share a scope with `fn`.  These are useful to instantiate any new variables/objects/classes for each cycle, and clean them up outside of the measured test loop.

## Additional Tools
In addition to `yb`, you'll have a few extra tools that may be helpful:

 * `yb-clean` - Removes `.builds` from your CWD and any `yui3-*` repo directories in your OS's temp directory.
 * `yb-compile` - Compiles a config file to an executable performance test (e.g. `yb-compile path/to/source.js`).  After execution, open the generated HTML file in a browser and take a look at the console for results.
 * `yb-parse` - Converts a raw JSON results file to pretty tables (e.g. `cat myResults.json | yb-parse`). Also, this provides a nice starting point if you want to make your own parser.

## Yogi
Additionally, you can performance test via [Yogi](https://github.com/yui/yogi) by
simply typing `yogi benchmark` from within your component's directory,
and it will execute any tests found in your component's `tests/performance/`
directory. If executed from the root level of the `yui3` repository, all performance
tests in the library will be executed.

For the time being, you will need a patched version of
Yogi, which you can find [this repo](https://github.com/derek/yogi/).
Clone, and execute `sudo npm install -g` to install.

### Options
The following options are passed from `yogi benchmark` to `yb`:

* `--loglevel`
* `--ref`
* `--timeout`
* `--tmp`
* `--working`

The following options are also supported:

* `outdir` - Where `--raw` files can be dumped.
* `component` - A specific component to test.

## License
YUI Benchmark is open-sourced with a BSD license.  See [LICENSE.md](LICENSE.md).
