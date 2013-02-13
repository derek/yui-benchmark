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
        this.name = config.name;
        this.yuiVersion = YUI.version;
        this.UA = getUA();

        if (config.constructor) {
            if (config.constructor === Benchmark.Suite) {
                this.benchmark = new config.constructor(config);
            }
            else if (config.constructor === Benchmark) {
                this.benchmark = new config.constructor(config);
            }
            else if (config.constructor === Benchmark.Deferred) {
                this.benchmark = new config.constructor(config);
            }
        }

        if (this.benchmark) {
            this.benchmark.on('complete', function () {
                var results = this[0];
                self.setValue(results.hz, results.stats);
            });
        }
    }

    YBench.prototype.setValue = function (val, stats) {
        var self = this,
            stats = stats || {};
            
        self._sendResult({
            component: self.component,
            name: self.name,
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