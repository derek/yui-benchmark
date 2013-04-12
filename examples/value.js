/**
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/
YUI.add('value', function (Y, NAME) {

    var timeStart = 0,
        frameCount = 0,
        scrollview,
        cb;

    Y.one('body').append(Y.Node.create('<ul id="container" style="white-space:nowrap"><li><p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.</p></li></ul>')),

    scrollview = new Y.ScrollView({
        srcNode: '#container',
        width: 600,
        frameDuration: 15,
        render: true
    });

    cb = scrollview.get('contentBox');

    function nextFrame () {
        if (frameCount === 0) {
            timeStart = Y.Lang.now();
        }

        frameCount = frameCount + 1;
    }

    function onScrollEnd () {
        var fps = frameCount / ((Y.Lang.now() - timeStart) / 1000),
            fps = fps.toFixed(2);

        if (Y.Benchmark) {
            Y.Benchmark.submitValue('ScrollView FPS', fps, 'fps');
        }
    }

    scrollview.after('scrollEnd', onScrollEnd);
    scrollview.after(['scrollXChange', 'scrollYChange'], nextFrame);

    Y.later(500, this, function () {
        cb.simulateGesture('flick', {
            distance: -10000,
            axis: 'x'
        });
    });

    // Globalize
    s = scrollview;
}, '@VERSION@', {requires: ['node', 'scrollview', 'node-event-simulate']});
