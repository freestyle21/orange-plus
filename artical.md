

最近有机会，尝试了一次微信开发，中间遇到很多比较容易踩得坑，记录一下。

主要功能是

1. 微信网页认证
2. 转盘抽奖
3. 微信公共号发红包给当前登录用户
4. 分享给好友和分享到朋友圈

## 微信限制

涉及到的资源:

微信公众平台： https://mp.weixin.qq.com/
微信商户平台： https://pay.weixin.qq.com/
微信API：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
微信开发者论坛: http://qydev.weixin.qq.com/qa/index.php?qa=questions

## 过程记录

#### 微信网页认证

条件：
1. 服务号
2. 通过微信认证

接口文档：http://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html

过程是获取用户授权的code，通过code获取access_code，然后通过access_code获取用户信息

其中有一个坑是，第一步获取用户授权的code，redirect_uri经常会报错"redirect_uri参数错误"，可能的原因是：

1. 公众平台后台设置授权回调域名
2. 回调页面有端口，授权也需端口
3. redirect_uri urlencode
4. 绑定已备案域名，主要域名必须是二级或二级以上域名；

如果以上问题都注意到后，还是有问题，便可以等几个小时，很可能是微信接口抽风了，我就是用着用着这个接口挂了，等了好几个小时自己好了。

第二个坑是，有时候报错”不能访问链接“，原因是微信后台设置的回调域名不对，有时候自己切换host后，域名不对，所以修改回调域名就好了。

第三个坑是，access_token会过期，用的时候建议每次都通过refresh_token去重新获取access_token

第四个坑是，用户授权后回跳的页面的时候，控制台报错

	`Resource interpreted as Document but transferred with MIME type application/octet-stream: "https://open.weixin.qq.com/connect/oauth2/..`

解决办法是，回调页面的url设置为`http://xxx.com`，而不是`xxx.com`

第五个坑，是授权回调页面，url会带有`?code=xxx`，不能直接分享这个url，会导致后面的用户授权不了。因为这个问题纠结了很久。

解决方式是，在node端解析code，然后写入cookie，通过url redirect到没有code的页面。另一种方式是，通过微信api，定制分享内容和分享的链接。

#### 公众号微信发红包给用户

条件：
通过微信认证
通过微信支付认证

接口地址：https://pay.weixin.qq.com/wiki/doc/api/tools/cash_coupon.php?chapter=13_1

第一个坑就是有时候会报错”签名错误“，可能原因及解决办法是：
1. 生成签名的密匙过期，重新去后台设置一下即可。
2. 加密的字符串需要按照ASCII排序
3. 如果还是没解决，可以去掉中文试试
4. 还是不正确，可以通过签名工具，把参数都输入后看输出的和自己的哪一步不对。
5. 最后，post请求传过去的body应该是xml格式，且xml格式需要严格按照xml语法，顺序最好和文档的一样。


第二个坑，是证书的使用。
官方下载会下载到三个证书，node用.p12后缀的，使用方式是在请求头设置 agent，然后设置密码。具体见文末的代码链接。


第三个坑，红包的描述和祝福语之类的设置中文会出现红包发送不出去的情况，解决方式是对中文进行unicode编码。


#### 分享给好友和分享到朋友圈

第一步，在微信后台设置`js接口安全域名`
第二步，引入js文件
第三步，通过config接口注入验证配置
	
	坑，signature签名获取方式是先获取 jsapi_ticket，通过access_token获取jsapi_ticket时总是报错，同一个未过期的access_token获取用户信息是可以的，获取jsapi_ticket就不行。

第四部，配置onMenuShareTimeline方法。可以自定义分享内容和链接。
	

最后，推荐html5的一些组件库

frozenUI： http://frozenui.github.io/

很出色的h5制作网站：http://h5.baidu.com/

