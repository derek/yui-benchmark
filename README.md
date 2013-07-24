# YUI Benchmark

`yui-benchmark` is a command-line tool to help simplify the process of
performance testing JavaScript.

## Features
 * Automated cross-browser testing (via [Yeti](http://yeti.cx/)).
 * Easily run performance tests against any version, tag, local branch, or commit of YUI, and compare results.
 * Don't worry about writing any boiler-plate code for performance testing. We'll take care of that for you.
 * Thanks to [PhantomJS](http://phantomjs.org/), it runs great hands-free and in CI environments.

## Installing

### OSX/Linux

	git clone git@git.corp.yahoo.com:drg/yui-benchmark.git
	cd yui-benchmark
	sudo npm install -g

### Windows
Coming soon.

## Using YUI Benchmark

From within the `yui3` repository

	$ yb path/to/config.js

Now point your browser to the URL displayed and let us take care of the rest.  Or, execute with the `--phantomjs` option for completely hands-free testing!

### CLI Options

* ``--loglevel=[string]`` - 'info' (default) or 'debug'
* ``--out=[path]`` - A path to dump the raw JSON
* ``--phantomjs=[boolean]`` - Use Phantom.js as your test browser. Default `false`.
* ``--port=[integer]`` - The HTTP port to listen on. Default `3000`.
* ``--pretty=[boolean]`` - Displays the results as pretty tables. Default `true`.
* ``--raw=[boolean]`` - Dumps the data as raw JSON . Default `false`.
* ``--ref=[string]`` - Which ref(s) of the YUI repository you'd like to execute the performance test against.
* ``--tempest=[boolean]`` - Logs the (noisy) Tempest output from Yeti on PhantomJS executed tests.  Useful for debugging.
* ``--timeout=[path]`` - How long to wait before aborting this process.
* ``--wip=[boolean]`` - Whether or not to include your working tree as a test ref. Defaults to `true`
* ``--yuipath=[path]`` - Path to your local YUI repository. If unspecified, `yb` assumes you are inside the repository.

## Performance Tests

In order to construct the most ideal and efficient performance test, your
source needs to be easily parsable.  The best way to do this is by constructing
a simple configuration object that contains all the ingredients in a
performance test suite.  Namely, a "suite" that contains a few bits of meta-data
and an array of "tests", which are the functions to measure the performance of.

To get a better idea, check out some examples in the YUI source tree

 * [app](https://github.com/derek/yui3/blob/new-perf/src/app/tests/performance/app.js)
 * [base](https://github.com/derek/yui3/blob/new-perf/src/base/tests/performance/)
 * [node](https://github.com/derek/yui3/blob/new-perf/src/node/tests/performance/)
 * [promise](https://github.com/derek/yui3/blob/new-perf/src/promise/tests/performance/promise.js)

### Suites
 * `title` - **Required**. The name of this suite.
 * `tests` - **Required**. An array of "test" objects.
 * `global` - An object containing `setup` and/or `teardown` functions to be run before/after any tests in the suite.
 * `slug` - A short-name for this suite. [A-Za-z-].
 * `html` - A string or relative path on your filesystem to some HTM to be placed inside the `body` tag.
 * `yui`
    * `config` - A YUI config object
    * `use` - An array of modules to include in your suite

### Tests
 * `title` - **Required**. The name of this test.
 * `fn` - **Required**. The function to test.
 * `async` - If this test should be considered an async test. If `true`, your `fn` will recieve a function as the first argument. Execute that when your test is complete.
 * `setup` - A function to execute before the test cycle. Shares scope with `fn`.  This will override anything specified in `global.setup`.
 * `teardown` - A function to execute after the test cycle. Shares scope with `fn`.  This will override anything specified in `global.teardown`.

## Additional Tools
YUI Benchmark also installs a few additional tools that may be helpful.

 * `yb-compile` - Compiles a config file to an executable performance test (e.g. `yb-compile path/to/config.js`).
 * `yb-clean` - Removes `yui3/.builds` and any `yui3-*` repo directories in your OS's temp directory. This is where `yb` clones repositories for builds.
 * `yb-parse` - Converts a raw JSON results file to pretty tables (e.g. `cat myResults.json | yb-parse`). Also, a nice startin point if you want to make your own parser.

## Yogi
Additionally, you can use via [Yogi](https://github.com/yui/yogi) by
simply typing `yogi benchmark` from within your component's directory,
and it will execute any tests found in your component's `tests/performance/`
directory. For this functionality, you will need a patched version of
Yogi, which you can find [this repo](https://github.com/derek/yogi/).
Clone, and execute `sudo npm install -g`.

### Options
* ``--loglevel=[string]`` - 'info' (default) or 'debug'
* ``--last3=[boolean]`` - Runs tests against the last 3 "minor" versions of YUI (e.g. `v3.9.0` + `v3.10.3` + `v3.11.0`)
* ``--last5=[boolean]`` - Runs tests against the last 5 versions

## License
`yui-benchmark` is open-sourced with a BSD license.  See [LICENSE.md].
