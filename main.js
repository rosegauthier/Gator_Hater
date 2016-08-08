$(function() {
	//define game object. All interactions happen here
	var game = {
		points: 0
	} //game

	var characters = {
		badGuy: {
			points: 25,
			image: [
			'assets/images/Gator1.png',
			'assets/images/Gator2.png',
			'assets/images/Gator3.png',
			'assets/images/Gator4.png',
			'assets/images/Gator5.png'
			]
		},
		goodGuy: {
			points: -25,
			image: [
			'assets/images/goodGuy1.png',
			'assets/images/goodGuy2.png',
			'assets/images/goodGuy3.png',
			'assets/images/goodGuy7.png'
			]
		}
	};

	//used to push game.points into after each games
	var userScores = [];
	//lets you sort numbers in an array by decending order
	function compareNumbers(a, b) {
		return b - a;
	}

	var splashAnimation = setInterval(function() {
		if ($(window).width() > 650) {
	        $('.gatorUp').toggleClass('gatorAnimate');
	        $('.haterDown').toggleClass('gatorAnimate');
	    }
	},1000);

    $('.start-button').on('click', enterGame);
    var action = 1;
    function enterGame() {
    	//user clicked button to enter game
        if (action === 1) {
            $('h1, .start-button, footer').fadeOut(function() {
            	$('.target, form, .start-button').fadeIn();
            	$('.start-button').text('Start Game');
            });
            action = 2;
        } else {
            //user clicked button to start game
        	$('.start-overlay').fadeOut();

        	// we added this .html because the .html we had "on click" of character would not work in this instance
        	$('.game-points').html(game.points);
        	$('.countdown').css("color", "white");
        	$('body').css('cursor', 'url(assets/images/cursor2.png), auto');

        	//game timer, with conditionals to stop essentially all functions at time-out
        	var startTime = 25;
        	var gameTimer = setInterval(function() {
        		var $countdown = $('.countdown');
        		$countdown.html(startTime);
        		if (startTime === 10) {
        			$countdown.css("color", "yellow");
        		} else if (startTime === 5) {
        			$countdown.css("color", "orange");
        		} else if (startTime === 0) {
        			$countdown.css("color", "red");
        			// define score to store game.points (which is set to zero shortly here after)
        			var score = game.points;
        			// push score to userScores, globally scoped
        			userScores.push(score);
        			// add user's most recent score to the try again overlay
        			$('.yourScore span').html(score);
        			// sort the scores in decending order by call back of CompareNumbers function scoped globally
        			userScores.sort(compareNumbers);
        			//reset game points to 0
        			game.points = 0;
        			//reset timers for game timer, and to stop characters from appearing
        			clearInterval(gameTimer);
        			clearInterval(characterAppear);
        			clearInterval(characterAppearAgain);
        			//remove all characters currently present on the screen
        			$('.character-image').remove();
        			$('.start-button').text("Play Again!");
        			$('.start-overlay').fadeIn();
        			$('body').css('cursor', 'default');
        			$('.yourScore').fadeIn();
        			$('.allScore').fadeIn();
        			$('.Score1').html(userScores[0]);
        			$('.Score2').html(userScores[1]);
        			$('.Score3').html(userScores[2]);

        		}
        		//Decrement the seconds. Leave this outside the conditional
        		startTime = startTime - 1;
        	}, 1000);
        	//creates timer to space out characters appearing in holes. Uses makeVisible function (below) to add html containing randomized image to randomized hole
        	makeVisible();
        	setTimeout(makeVisible, 1000);
        	var characterAppear = setInterval(makeVisible, 1500);
        	var characterAppearAgain = setInterval(makeVisible, 2000);
        }
    }

	//number of holes based on html elements with class of .hole
 	var numberOfHoles = $('.hole').length;
 	var counter = 0;
 	var checkLastRand = [];
 
 	//This function is passed into the setInterval initialized at start to begin generating characters
	function makeVisible() {
		var randomBadGuy = Math.floor( Math.random() * characters.badGuy.image.length);
		var randomGoodGuy = Math.floor( Math.random() * characters.goodGuy.image.length);
		var randomHole = Math.ceil( Math.random() * numberOfHoles );
		//variable storing string interpolation, with the data position value determined by above generated random number
		var randomDataPosition = `*[data-position="${randomHole}"]`;
		//add randomly generated hole to the beginning of an array, then check the most recently added indices for overlap in positioning
		checkLastRand.unshift(randomHole);
		if (checkLastRand[0] !== checkLastRand[1] && checkLastRand[0] !== checkLastRand[2]) {
			// Adding two image sources to the game for the good guy and bad guy
			var badGuyImageSource = `<div data-points="${characters.badGuy.points}" class="character-image character-${counter}"><img src="${characters.badGuy.image[randomBadGuy]}"></div>`;
			var goodGuyImageSource = `<div data-points="${characters.goodGuy.points}" class="character-image character-${counter}"><img src="${characters.goodGuy.image[randomGoodGuy]}"></div>`;
			//create an array containing the images sources. More bad guys than good guys for more clicking for the user
			var randomImageSource = [badGuyImageSource, badGuyImageSource, badGuyImageSource, goodGuyImageSource];
			//use a randomly selected hole and attach an image source based on a random number
			var randomImageIndex = Math.floor( Math.random() * randomImageSource.length);
			var $characterToAppend = $(randomImageSource[randomImageIndex]);

			$(randomDataPosition).append($characterToAppend);
			//fadeIn the newly generated character image
			$characterToAppend.fadeIn(0).animate({bottom: '200%'}, 700);
		} //end overlap conditional

		var userSelectedDifficulty = $('input[name=difficulty]:checked').val();

		//add a counter to add an incrementing class name to character. This is so we can have the remove function below remove just the last appeared character, not all characters. Uses an iife to protect the variable while waiting for the setTimeout. Delay of setTimeout is determined by user input regarding difficulty
		var characterDisappear = (function(currentCounter){
			setTimeout(function() {
				$('.character-' + currentCounter).css('bottom', '200%').animate({bottom: '-100%'}, 700, function(){
				$(this).remove();
			});
				}, userSelectedDifficulty)
		})(counter);
		counter = counter + 1;
	} //end makeVisible


	//user whacks character, attributed points are added to the total points and character is immediately hidden
	$('.hole').on('click', '.character-image', function() {
		game.points = game.points + $(this).data('points');
		$('.game-points').html(game.points);
		if (($(this).data('points')) > 0 ) {
			$(this).html(`<p class="points-awarded">+25</p><img src="assets/images/Kapow.png" class="kapow">`)
			setTimeout(function () {
				$('.kapow, .points-awarded').remove();
			}, 250);
		} else {
			$(this).html(`<p class="points-awarded lose-points">-25</p><img src="assets/images/Sorry.png" class="sorry">`)
			setTimeout(function () {
				$('.sorry, .points-awarded').remove();
			}, 250);
		}
		
	});

}); // doc ready








	// To Do 
	// 2. responsive 
	// bonus: add music
	// bonus: add themes


	// Killed It: 
	// 1. Hiding character even if not clicked DONE 
	// 2. Figure out how to get two characters at one time AND get them to not go to the same place.
	// 3. Add character that you aren't supposed to hit and it takes away points 
	// 4. Jquery animate method 
	// 		- toggle in and out
	// 1. Jquery animate method 
	// 		- click and Kapow happens and hides
	// 4. More variation on characters
	// 3. Click area and icon