define(function(require, exports, module){
    var APPID = 'wx7ccadc024b3b0001';
    var url = 'http://ty.17gu.com';
    var WEIXIN_AUTH = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + APPID + '&redirect_uri='+ encodeURIComponent(url) +'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';


    module.exports = {
        // 用户信息
        openid: '',
        nickname: '',

        code: '',
        access_token: '',
        openid: '',

        startAuth: function() {
            // 第一次：http://plus.com
            // 第二次：http://plus.com/?code=xxxx&state=STATE
            // 微信授权

            var code = this.getQueryString('code');
            // 第一步 用户同意授权，获取code
            if(!code) {
                location.href = WEIXIN_AUTH
                return false;
            }

            this.code = code;
            this.getAccessCode()
        },

        // 第二步：通过code换取网页授权access_token
        getAccessCode: function() {
            var ctx = this;

            $.ajax({
                url: '/getAccess/' + APPID + '/' + this.code,
                success: function(data) {
                    ctx.access_token = data.access_token;
                    ctx.openid = data.openid;

                    ctx.getUserInfo()
                }
            })
        },
            
        // 第四步：拉取用户信息(需scope为 snsapi_userinfo)
        getUserInfo: function() {
            var ctx = this;

            $.ajax({
                url: '/getUserInfo/' + this.access_token + '/' + this.openid,
                success: function(data) {
                    ctx.openid = data.openid;
                    ctx.nickname = data.nickname;
                }
            })
        },

        // 发红包。
        // @param number 红包数量/单位分
        // @param callback 回调函数
        sendRedPack: function(number, callback) {
            var money = number || '0'; // 单位是分

            $.ajax({
                url: '/getMoney/' + money + '/' + this.openid,
                success: function(json) {
                    callback && callback(json && json.data)
                }
            })
        },

        getQueryString: function(name) { 
            var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); 
            var r = window.location.search.substr(1).match(reg); 
            if (r!=null) return unescape(r[2]); return null; 
            }  
        }
});
