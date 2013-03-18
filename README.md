YUI Benchmark
===

`yui-benchmark` is a tool that allows you to execute performance tests and gather benchmark results across different versions of the library for easy comparison.

How
---
In order to use `yui-benchmark`, you will first need to clone this repository and execute `sudo npm install -g`.  Additionally, you will also need a patched version of Yeti installed, so clone [this repo](https://github.com/derek/yeti/) and run `npm link`.

At this point, you have everything you need to gather raw JSON dumps of performance tests.  You can test it out by running

```
yui-bench --yuipath=/path/to/yui --iterations=1 --source=tests/benchmark/scrollview-benchmark.html --phantomjs=true --json=true --ref=v3.8.0 --ref=v3.9.0 --ref=HEAD
```

Additionally, you can use via [Yogi](https://github.com/yui/yogi) by simply typing `yogi bench` from without your component's directory, and it will execute any tests found in your local `tests/benchmark/` directory.  For this functionality, you will also need a patched version of Yogi, which you can find [this repo](https://github.com/derek/yogi/).  Clone, and execute `sudo npm install -g`.


Options
---

* ``--yuipath=[path]`` - Path to your local YUI repository. **(required)**
* ``--source=[path]`` - The benchmark test. **(required)**
* ``--ref=[string]`` - Which ref(s) of the YUI repository you'd like to execute the performance test against. **(required)**
* ``--iterations=[integer]`` - How many times each test should be executed. Default `1`.
* ``--phantomjs=[boolean]`` - Use Phantom.js as your test browser. Default `false`.
* ``--port=[integer]`` - The HTTP port to listen on. Default `3000`.
* ``--datapath=[path]`` - A path to dump the JSON output to