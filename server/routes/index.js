/**
 * Page Router & Ajax API.
 */

'use strict';

var fs = require('fs');
var url = require('url');
var request = require('request');
var querystring = require('querystring');
var moment = require('moment');
var md5 = require('md5');
var randomstring = require("randomstring");
var parseString = require('xml2js').parseString;

var util = require('../common/util');
var koaRequest = require('koa-request');
var HttpResponse = require('../common/httpResponse');
var Redpack = require('weixin-redpack');
var httpMethod = require('../common/httpMethod');
var dataCenter = require('../common/dataCenter');

var APPID = 'wx7ccadc024b3b0001';
var MCHID = '1325672901';
var SECRET_KEY = '6RjCC4xw0ov8RmwQ6MwHQdRFKvBRTf1E';
var SHOP_NAME = '统一饮品集趣吧';
var APPID = 'wx7ccadc024b3b0001';
var REDIRECT_URI = 'http://f2e.xiaojukeji.com';
var WEIXIN_AUTH = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + APPID + '&redirect_uri='+ encodeURIComponent(REDIRECT_URI) +'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';



var ACCESS_TOKEN = 'https://api.weixin.qq.com/sns/oauth2/access_token';
var APPSECRET = '5e8e8078f29190b657eaa3da42077379';
var GET_USER_INFO = 'https://api.weixin.qq.com/sns/userinfo';



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

function* getAccessToken(code, ctx) {
    var url = ACCESS_TOKEN + '?appid='
            + APPID + '&secret=' + APPSECRET + '&code=' 
            + code + '&grant_type=authorization_code';

    var config = getCommonConfig(url);

    var response = yield koaRequest(config);

    var info = JSON.parse(response.body);

    dataCenter.access_token = info.access_token
    dataCenter.openid = info.openid

    return yield getUserInfo(ctx)
}
function* getUserInfo (ctx) {
    var access_token = dataCenter.access_token
    var openid = dataCenter.openid

    var url = GET_USER_INFO + '?access_token='+access_token+'&openid='+openid+'lang=zh_CN'

    var config = getCommonConfig(url);
    
    var response = yield koaRequest(config);

    var info = JSON.parse(response.body);

    dataCenter.nickname = info.nickname
    return info
    // { openid: 'ov5W9wqUDaoK4JSNdeToKz8GIqpo',
    //   nickname: '瞿宝明',
    //   sex: 1,
    //   language: 'zh_CN',
    //   city: 'Hangzhou',
    //   province: 'Zhejiang',
    //   country: 'CN',
    //   headimgurl: 'http://wx.qlogo.cn/mmopen/JVDECnNjedGkk95eP3SvIFZheUa42eoLNOhrgTV2OrTunlBcicGmKBgovhIZhHGHmb8EADnQvgtEHptobVicQEgCfU8nuK8L5f/0',
    //   privilege: [] }
}

module.exports = function(app) {
    app.get('/', function* (next) {
        var urlData = util.getURLQueryString(this.originalUrl);

        if(urlData.code) {
            var userInfo = yield getAccessToken(urlData.code, this)
            if(userInfo.openid) {
                this.res.setHeader('Set-Cookie', ['user_openid='+userInfo.openid]);
                this.redirect('/')
            }
        } else {
            if(this.cookies.get('user_openid')) {
                // 有cookie才进入，没有需要重新去请求用户信息
                yield this.render('../index')
            } else {
                this.redirect(WEIXIN_AUTH);
            }
        }
    });

        
    app.get('/getMoney/:moneyNum/:openid', function *(next) {
        var ctx = this;
        var ORDER_ID = '1325672901' + moment().format('YYYYMMDD') + moment().format('MMDDHHmmss');
        var RANDOM_NUM = randomstring.generate({
          length: 16,
          charset: 'alphanumeric'
        });

        var moneyNum = this.params.moneyNum;
        var openid = this.params.openid;

        var PFX = process.cwd() + '/server/cert/apiclient_cert.p12';
        var url = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack';

        var postData = {
            nonce_str: RANDOM_NUM, //随机字符串
            mch_billno: ORDER_ID, //商户订单号,
            mch_id: MCHID, // 商户号,
            wxappid: APPID, // 公众账号appid
            send_name: 'tongyi', // 商户名称
            re_openid: openid, // 用户openid  
            total_amount: moneyNum, // 付款金额   
            total_num: '1', // 红包发放总人数
            wishing: 'goodluck', //红包祝福语
            client_ip: getClientIp(this.req), // Ip地址  
            act_name: 'plus', // 活动名称   
            remark: 'remark' // 备注,
        };
        var sign = getSign(postData);
        postData.sign = sign;
        
        var  postXMLData = '<xml>';
            postXMLData += "<act_name>"+postData.act_name+"</act_name>";
            postXMLData += "<client_ip>"+postData.client_ip+"</client_ip>";
            postXMLData += "<mch_billno>"+postData.mch_billno+"</mch_billno>";
            postXMLData += "<mch_id>"+postData.mch_id+"</mch_id>";
            postXMLData += "<nonce_str>"+postData.nonce_str+"</nonce_str>";
            postXMLData += "<re_openid>"+postData.re_openid+"</re_openid>";
            postXMLData += "<remark>"+postData.remark+"</remark>";
            postXMLData += "<send_name>"+postData.send_name+"</send_name>";
            postXMLData += "<total_amount>"+postData.total_amount+"</total_amount>";
            postXMLData += "<total_num>"+postData.total_num+"</total_num>";
            postXMLData += "<wishing>"+postData.wishing+"</wishing>";
            postXMLData += "<wxappid>"+postData.wxappid+"</wxappid>";
            postXMLData += "<sign>"+postData.sign+"</sign>";
            postXMLData += "</xml>";

        function sendRedPack(callback) {
            request({
              url: url,
              method: 'POST',
              body: postXMLData,
              agentOptions: {
                    pfx: fs.readFileSync(PFX),
                    passphrase: MCHID
              }
            }, function(err, response, body){
                parseString(body, function(err, result) {
                    var result = {
                        code: 200,
                        data: result.xml,
                        message: 'success'
                    }
                    callback(null, result)
                })
                
            });
        }
        this.body = yield sendRedPack;
    })

    // 获取签名
    function getSign(obj) {
        // console.log('元素obj:')
        // console.log(obj)
        var parmsString = querystring.stringify(obj)
        var stringAArr = parmsString.split('&');
        var stringA = stringAArr.sort().join('&');
        // console.log('第一步:' + stringA)

        // 以上是按ASCII排序

        var stringSignTemp = stringA + '&key=' + SECRET_KEY;
        // console.log('第二步：'+stringSignTemp)

        stringSignTemp = (stringSignTemp)
        var sign = md5(stringSignTemp).toUpperCase();

        // console.log('第四步：'+sign)
        return sign;
    }
    function getClientIp(req) {
        var ip = req.headers['x-forwarded-for'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             req.connection.socket.remoteAddress;

        return ip.replace('::ffff:', '');
    }
}

