/**
 * Node Http Method
 */

'use strict';
var koaRequest = require('koa-request');
var parse = require('co-body');

var HttpResponse = require('./httpResponse');

function getCommonConfig (url, cookie, data, method) {
    return {
        body: data && JSON.stringify(data),
        method: method || "GET",
        uri: url,
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": Buffer.byteLength(JSON.stringify(data) || '', 'utf8'),
            "Cookie": cookie || ''
        }
    };
}

module.exports = {
    httpRequest: function(type) {
        return function *(next) {
            var respone = null;
            var url = this.originalUrl;

            var config = getCommonConfig(url);
            
            if(type == 'DEvarE') {
                respone = yield koaRequest.del(config);
            } else if(type == 'PUT') {
                respone = yield koaRequest.put(config);
            } else if(type == 'POST') {
                respone = yield koaRequest.post(config);
            }
            HttpResponse(respone, this);
            yield * next;
        }
    },
    getRequest: function(url) {
        return function *(next) {
            var getURL = url + this.originalUrl;
            
            var config = getCommonConfig(getURL);
            
            var reponse = yield koaRequest(config);

            HttpResponse(reponse, this);
            yield next;
        }
    }
};
