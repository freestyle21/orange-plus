define(function(require, exports, module){
	var auth = require('/js/auth')
    var rotate = require('/js/rotate')
			
	// fullpage.
	$('.wp-inner').fullpage()

   	// auth.
    auth.startAuth()

    rotate.readyRotate()
});
