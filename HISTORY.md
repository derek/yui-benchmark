v0.0.7
------

 * Added 7 minute timeout to `yeti.createBatch()` to allow for long-running tests
 * Added support for HTML files as the `--source` input
 * Added error handing for Yeti clients, so script errors now appear in the CLI output
 * Added --timeout=[seconds]
 * Added support for non-Benchmark.js / value-based tests
 * Delayed shutdown of `yb` to allow for redirection back to Yeti's wait page
 * Always load the WIP YUI seed on to the page as `YUI` 
 * Refactored URL routing to make the URLs a bit more sane
 * Renamed executable from `yui-benchmark` to `yb`
 * Removed requirements for --yuipath and --source. argv[0] defaults to `--source`

v0.0.6
------


v0.0.5
------


v0.0.4
------


v0.0.3
------


v0.0.2
------


v0.0.1
------

