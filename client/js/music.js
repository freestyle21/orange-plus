define(function(require, exports, module){

	module.exports = {
		startMusic: function() {
			$('.music').on('click', function() {
				var img = $(this).find('img');
				var audio = $('#music')[0]

				if($(img).hasClass('play') ) {
					$(img).attr('src', '/img/music-1.png')
					audio.pause()
				} else {
					$(img).attr('src', '/img/music-0.png')
					audio.play()
				}

				$(img).toggleClass('play')

			})
		}
	};
});
