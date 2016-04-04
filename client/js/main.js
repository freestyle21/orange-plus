define(function(require, exports, module){
	var auth = require('/js/auth')
    var rotate = require('/js/rotate')
    var music = require('/js/music')
			
	// fullpage.
	$('.wp-inner').fullpage()

    music.startMusic()

    rotate.readyRotate()
});
