define(function(require, exports, module){

    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60)
            }
    })();

    // 一等奖 [ 112° ] 5元
    // 二等奖 [ 22, 157, 247 ] 3元
    // 三等奖 [ 67, 292 ] 1元
    // 无    [ 202, 337 ]

    // 概率分别为 30 30 30 10
    module.exports = {
        rewardsLevel: '', // 当前的奖项。 0/1/2/3
        running: false,
        lostDeg: [360],
        totalDeg: 360 * 3 + 0,
        steps: [],
        now: 0,
        a: 0.01,

        rewards: [1,2,2,2,3,3,3,0,0,0],
        rewardsMap: {
            0: 22,
            1: 247,
            2: 112,
            3: 67
        },

        readyRotate: function() {
            this.bindClick()
        },

        calcEndDeg: function() {
            var endDeg = 0;
            // 0-9
            var randomNum = parseInt(10 * Math.random());

            var rewardsLevel = this.rewards[randomNum]
            
            endDeg = this.rewardsMap[rewardsLevel];

            this.rewardsLevel = rewardsLevel;

            return endDeg;
        },

        bindClick: function() {
            var ctx = this;
            // 
            $('.page6').on('click', '#inner', function() {

                if ( ctx.running ) {
                    return;
                }
                
                var endDeg = ctx.calcEndDeg()
                ctx.start( endDeg, 0 );
                // start( prizeDeg[res.list.index - 1], res.list.index );
            });
        },
        start: function(deg, index) {
            deg = deg || this.lostDeg[parseInt(this.lostDeg.length * Math.random())];
            this.running = true;
            this.totalDeg = 360 * 6 + deg;
            this.steps = [];
            this.now = 0;
            this.countSteps();
            requestAnimFrame( this.step.bind(this) );
        },
        countSteps: function() {
            var t = Math.sqrt(2 * this.totalDeg / this.a);
            var v = this.a * t;
            for ( var i = 0; i < t; i++ ) {
                this.steps.push( (2 * v * i - this.a * i * i) / 2 )
            }
            this.steps.push( this.totalDeg )
        },
        step: function() {
            $('#outer').get(0).style.webkitTransform = "rotate(" + this.steps[this.now++] + "deg)";
            $('#outer').get(0).style.MozTransform = "rotate(" + this.steps[this.now++] + "deg)";
            $('#outer').get(0).style.transform = "rotate(" + this.steps[this.now++] + "deg)";

            if ( this.now < this.steps.length ) {
                this.running = true;
                requestAnimFrame( this.step.bind(this) );
            } else {
                this.running = false;
            }
            
            if( this.now == 660 && this.steps.length == 659 ) {
                alert( "别灰心，明天再来！" );
            }
            if( (this.now == 609 && this.steps.length == 609 ) 
                || (this.now == 645 && this.steps.length == 645) ) {
                alert('.....')
                // $( ".mark, .pop-2" ).show();
            }
        }
    };
});
