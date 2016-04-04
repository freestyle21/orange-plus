/**
 * Node Server Util Tool
 */

'use strict';


module.exports = {
    getURLQueryString: function(url) {
        var query_string = {};
        var query = url.substring(url.indexOf('?') + 1);

        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if(!pair[0] || !pair[1]) return {};
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    },
    getCookieFromStr: function(str, name) {
        var arr,reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if(arr = str.match(reg)) {
            return unescape(arr[2]);
        } else {
            return '';
        }
    },

    // 判断是否是测试环境
    isDevelopmentEnv: function() {
        var app = require('../app');
        if(app.env == 'development') {
            return true;
        } else {
            return false;
        }
    }
};