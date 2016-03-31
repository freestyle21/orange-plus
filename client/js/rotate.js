define(function(require, exports, module){
    var APPID = 'wx7ccadc024b3b0001';
    var peoples = require('./people')
    var auth = require('./auth')

    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60)
            }
    })();


    function findNumberByName (name) {
        var number = '';

        peoples.forEach(function(val) {
            if(val.name == name) {
                number = val.number;
            } 
        })
        return number
    }
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

        isCorrectName: false,

        readyRotate: function() {
            this.bindClick()
        },

        calcEndDeg: function() {
            var endDeg = 0;
            // 0-9
            var randomNum = parseInt(10 * Math.random());

            var rewardsLevel = this.rewards[randomNum]
                
            console.log(rewardsLevel)
            endDeg = this.rewardsMap[rewardsLevel];

            this.rewardsLevel = rewardsLevel;

            return endDeg;
        },

        bindClick: function() {
            var ctx = this;
            // 
            $('.page6').on('click', '#inner', function() {
                // if(!ctx.checkQuestionCorrect()) {
                //     $('.answer-question').dialog('show')
                //     return false;
                // }
                if(false) {
                // if(!ctx.isCorrectName) {
                    $('.input-name').dialog('show')
                    return false;
                }
                if ( ctx.running ) {
                    return;
                }
                
                var endDeg = ctx.calcEndDeg()
                ctx.start( endDeg, 0 );
                // start( prizeDeg[res.list.index - 1], res.list.index );
            });

            $('#input-name').on('click', function() {
                var name = $('#name').val()
                var number = $('#number').val()
                if(number == findNumberByName(name)) {
                    ctx.isCorrectName = true;
                    $('.page6 #inner').click()
                    return true;
                } else {
                    $('#trips').html('工号或者名字错误!')
                    return false;
                }
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

            
            if( this.now == 663 && this.steps.length == 662 ) {
                $("#trips-content").text('真不走运，再来一次吧！')
                $('.trips').dialog('show')
            }   
            if( this.now == 696 && this.steps.length == 695 ) {
                auth.sendRedPack(500, sendCallback) // 一等奖发5元
            }
            if(this.now == 678 && this.steps.length == 676) {
                auth.sendRedPack(300, sendCallback) // 2等奖发3元
            } 
            if(this.now == 669 && this.steps.length == 669) {
                auth.sendRedPack(100, sendCallback) // 3等奖发1元
            }

            function sendCallback(data) {
                if(data.return_code && data.return_code[0] == 'SUCCESS') {
                    var msg = data.return_msg[0].replace('该用户今日领取红包个数超过限制,如有需要请登录微信支付商户平台更改API安全配置','您今日已领取红包，明日再来吧~')

                    $("#trips-content").text(msg)
                    $("#trips-content").append('<div style="margin-top:10px">快右上角分享给同事吧！</div>')
                    $('.trips').dialog('show')
                } else {
                    $("#trips-content").text(data.return_msg[0])
                    $('.trips').dialog('show')
                }
            }
            // this.now:663
            // rotate.js:130 this.steps.length:662
            // this.now:663
            // rotate.js:130 this.steps.length:662
            // this.now:663
            // rotate.js:130 this.steps.length:662
            // this.now:663
            // rotate.js:130 this.steps.length:662
            // wu
            // ===

            // this.now:696
            // rotate.js:130 this.steps.length:695
            // this.now:696
            // rotate.js:130 this.steps.length:695
            // 1
            // ====

            // this.now:678
            // rotate.js:130 this.steps.length:676
            // this.now:678
            // rotate.js:130 this.steps.length:676
            // this.now:678
            // rotate.js:130 this.steps.length:676
            // this.now:678
            // rotate.js:130 this.steps.length:676
            // 2
            // ====

            // this.now:669
            // rotate.js:130 this.steps.length:669
            // this.now:669
            // rotate.js:130 this.steps.length:669
            // this.now:669
            // rotate.js:130 this.steps.length:669
            // this.now:669
            // rotate.js:130 this.steps.length:669
            // 3
            // ====
        },

        // 检查答案是否正确
        checkQuestionCorrect: function() {
            var isCorrect = false;

            console.log($('.q1 input:checked').val())
            console.log($('.q2 input:checked').val())
            console.log($('.q3 input:checked').val())
            console.log($('.q4 input:checked').val())
            console.log($('.q5 input:checked').val())
            if($('.q1 input:checked').val() == '3'
                && $('.q2 input:checked').val() == '2'
                && $('.q3 input:checked').val() == '1'
                && $('.q4 input:checked').val() == '0'
                && $('.q5 input:checked').val() == '1') {
                isCorrect = true;
            }
            return isCorrect;
        }
    };
});
