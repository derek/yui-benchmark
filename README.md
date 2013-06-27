# YUI Benchmark

`yui-benchmark` is a tool that simplifies the performance testing process, and
is designed to be used both manually and in automated CI systems.

## How

Installing `yui-benchmark` is pretty simple, you just need a patched version
of Yeti (for the time being.  Here are instructions for installing it on OSX.

	git clone git@git.corp.yahoo.com:drg/yui-benchmark.git
	git clone -b benchmark git://github.com/derek/yeti.git
	cd yui-benchmark
	sudo npm link
	sudo npm link ../yeti

Now you can begin using `yui-benchmark`.

For starters, execute this command from your `yui-benchmark` root directory,
then open the browser(s) of your choice to give it a spin.

	yb --yuipath=../yui3/ --source=examples/benchmarkjs-suite.js

Or from inside your yui repository

	yb --source=src/path/to/test.js

Additionally, you can use via [Yogi](https://github.com/yui/yogi) by
simply typing `yogi benchmark` from within your component's directory,
and it will execute any tests found in your local `tests/benchmark/` directory.
For this functionality, you will also need a patched version of Yogi,
which you can find [this repo](https://github.com/derek/yogi/).
Clone, and execute `sudo npm install -g`.

## Options
* ``--source=[path]`` - Path to the benchmark test.
* ``--yuipath=[path]`` - Path to your local YUI repository. If unspecified, `yb` assumes you are inside the repository.
* ``--ref=[string]`` - Which ref(s) of the YUI repository you'd like to execute the performance test against.
* ``--iterations=[integer]`` - How many times each test should be executed. Default `1`.
* ``--phantomjs=[boolean]`` - Use Phantom.js as your test browser. Default `false`.
* ``--port=[integer]`` - The HTTP port to listen on. Default `3000`.
* ``--raw=[boolean]`` - Dumps the data as raw JSON . Default `false`.
* ``--pretty=[boolean]`` - Displays the results as pretty tables. Default `true`.

## License
`yui-benchmark` is open-sourced with a BSD license.  See [LICENSE.md].
