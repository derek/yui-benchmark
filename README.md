YUI Benchmark
===

`yui-benchmark` is a tool that allows you to execute performance tests and gather benchmark results across different versions of the library for easy comparison.

How
---
Installing `yui-benchmark` is pretty simple, you just need a patched version of Yeti for the time being.  Here are instructions for installing it on an OSX machine.

	git clone git@git.corp.yahoo.com:drg/yui-benchmark.git
	git clone -b benchmark git://github.com/derek/yeti.git
	cd yui-benchmark
	sudo npm link
	sudo npm link ../yeti

Now you can begin using `yui-benchmark`.

For starters, execute this command from your `yui-benchmark` root directory, then open the browser(s) of your choice to give it a spin.

	yb --yuipath=../yui3/ --source=examples/benchmarkjs-suite.js

Or from inside your yui repository

	yb src/path/to/test.js

Additionally, you can use via [Yogi](https://github.com/yui/yogi) by simply typing `yogi benchmark` from within your component's directory, and it will execute any tests found in your local `tests/benchmark/` directory.  For this functionality, you will also need a patched version of Yogi, which you can find [this repo](https://github.com/derek/yogi/).  Clone, and execute `sudo npm install -g`.


Options
---

* ``--source=[path]`` - The benchmark test. By default, this is pulled off as the first argv argument.
* ``--yuipath=[path]`` - Path to your local YUI repository.
* ``--ref=[string]`` - Which ref(s) of the YUI repository you'd like to execute the performance test against. **(required)**
* ``--iterations=[integer]`` - How many times each test should be executed. Default `1`.
* ``--phantomjs=[boolean]`` - Use Phantom.js as your test browser. Default `false`.
* ``--port=[integer]`` - The HTTP port to listen on. Default `3000`.
* ``--raw=[boolean]`` - Dumps the data as raw JSON . Default `false`.
* ``--pretty=[boolean]`` - Displays the results as pretty tables. Default `true`.