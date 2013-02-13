YUI.add('ybench', function (Y, NAME) {

    var Bench;

    function getUA () {
        var ua = null;
        Y.each(Y.UA, function(v, k) {
            if (!Y.Lang.isFunction(v) && v && Y.Lang.isNumber(v)) {
                ua = k + " " + v;
            }
        });
        return ua;
    }

    function YBench(config) {
        var self = this;

        this.component = config.component;
        this.title = config.title;
        this.yuiVersion = YUI.version;
        this.UA = getUA();

        if (config.type === "benchmarkjs") {
            this.bench = new Benchmark.Suite(this.title);

            this.bench.on('complete', function () {
                var results = this[0];
                self.setValue(results.hz, results.stats);
                console.log(this);
            });
        }

        return this.bench;
    }

    YBench.prototype.setValue = function (val, stats) {
        var self = this,
            stats = stats || {};
            
        self._sendResult({
            component: self.component,
            title: self.title,
            yuiVersion: self.yuiVersion,
            UA: self.UA,
            value: val,
            stats: stats
        });
    }

    YBench.prototype.go = function () {
        Bench.run({async:true});
    }

    YBench.prototype._sendResult = function (result) {
        xhr("/write", function (err, data, xhr){
            window.location = JSON.parse(data).location;
        }, 'POST', 'result=' + JSON.stringify(result));
    }

    Y.Bench = YBench;
});