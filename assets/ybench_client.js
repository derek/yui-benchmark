YUI.add('ybench', function (Y, NAME) {

    var Bench;

    function getUA () {
        var ua = null;
        Y.each(Y.UA, function(v, k) {
            if (!Y.Lang.isFunction(v) && v && Y.Lang.isNumber(v)) {
                ua = k + v;
            }
        });
        return ua;
    }

    function YBench(config) {

        Bench = new Benchmark(config.title, config.fn, {
            onComplete: function () {
                var result = {
                    component: config.component,
                    title: config.title,
                    yuiVersion: YUI.version,
                    UA: getUA(),
                    ops: this.hz,
                    runs: this.stats.sample.length,
                    deviation: this.deviation,
                    mean: this.stats.mean,
                    moe: this.stats.moe,
                    rme: this.stats.rme,
                    sem: this.stats.sem,
                    variance: this.stats.variance
                };

                xhr("/write", function (err, data, xhr){
                    window.location = JSON.parse(data).location;
                }, 'POST', 'result=' + JSON.stringify(result));
            }
        });
    }

    YBench.prototype.go = function () {
        Bench.run({async:true});
    }

    Y.Bench = YBench;
});