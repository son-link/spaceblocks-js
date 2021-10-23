// The canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.font = '8px PixelOperator8';

// Init some global variables
var drawInterval = null;
var score = 0;
var lives = 3;
var framesCount = 0;
var blocks = [];
var upSpeedAt = 30;

// The ship object
function Ship() {
	this.img = new Image();
	this.img.src = 'assets/ship_2.png';
	this.posx = 72;
	this.posy = canvas.height - 32;
	this.pos = 4;
	this.draw = function() {
		ctx.beginPath();
		ctx.drawImage(this.img, this.posx, this.posy);
		ctx.fill();
	}
}

// Cursor object
function Cursor() {
	this.img = new Image();
	this.img.src = 'assets/cursor.png';
	this.posx = 80;
	this.posy = 0;
	this.draw = function() {
		ctx.beginPath();
		ctx.drawImage(this.img, this.posx, this.posy);
		ctx.fill();
	}
}

/**
 * Returns the a randomly sorted array
 *
 * @param {Array} arr
 * @returns The a randomly sorted array
 */
function randomArray (arr) {
	return arr.sort(() => Math.random() - 0.5);
}

/**
 * This function scrolls through the lines until it finds a block in the column or reaches the end.
 * @returns A integer with the position or false
 */
const checkPosition = () => {
	let v = 0;
	
	if (blocks.length == 0) return false;

	for (i=0; i < blocks.length; i++) {
		line = blocks[i];
		if (typeof blocks[i+1] === 'undefined' && line[ship.pos] == 0) {
			v = i;
			break;
		} else if (line[ship.pos] == 0 && blocks[i+1][ship.pos] == 1) {
			v = i;
			break;
		} else if (i == 0 && line[ship.pos] == 1) {
			v = false;
			break;
		}
	}
	return v;
}

/**
 * Set the vertical position of the player cursor
 */
const setCursorPos = () => {
	cp = checkPosition();
	if (typeof cp === 'number') {
		if (cp == blocks.length - 1) cursor.posy = 0;
		else cursor.posy = ((blocks.length - cp - 1) * 16)
	} else cursor.posy = (blocks.length) * 16
}

/**
 * This function is called each time the player fires and will add a new block.
 */
const shot = () => {
	if (blocks.length > 0) {
		let cp = checkPosition();
		if (typeof cp === 'number') {
			blocks[cp][ship.pos] = 1;
		} else {
			let tempLine = [];
			let tempTable = [];
			
			for (i=0; i < 10; i++) {
				if (i == ship.pos) tempLine[i] = 1;
				else tempLine[i] = 0;
			}

			tempTable[0] = tempLine;

			for(i=0; i < blocks.length; i++) {
				tempTable[i+1] = blocks[i]
			}

			blocks = tempTable
		}
	} else {
		tempLine = [];
		tempTable = [];

		for (i=0; i < 10; i++) {
			if (i == ship.pos) tempLine[i] = 1
			else tempLine[i] = 0
		}

		blocks.unshift(tempLine)
	}
	score = score + 10
	checkLines()
	setCursorPos()
}

/**
 * This function goes through the lines to check if a line is complete and then delete it.
 */
const checkLines = () => {
	for (i=0; i < blocks.length; i++) {
		let cont = 0;
		let line = blocks[i];
		line.forEach( (v, i) => {
			if (v == 1) cont++;
		});

		if (cont == 10) {
			upSpeedAt--;
			blocks.splice(i,1);
		}
	}
}

// The block image
var block = new Image();
block.src = 'assets/block.png';

// Background
var background = new Image();
background.src = 'assets/background.png';

// Init new object for the ship and cursor
const ship = new Ship();
const cursor = new Cursor();

/**
 * This function draws the game on the screen
 */
const draw = () => {
	ctx.drawImage(background, 0, 0);
	blocky = (blocks.length - 1) * 16;
	ctx.beginPath();
	blocks.forEach( function(line) {
		blockx = 16;
		for (x=0; x < 10; x++) {
			if (line[x] == 1) {
				ctx.drawImage(block, blockx, blocky);
			}
			blockx += 16;
		}
		blocky -= 16;
	});

	setCursorPos();
	ctx.fill();
	ship.draw();
	cursor.draw();

	// Show score, lives, etc
	ctx.fillText(`LIVES: ${lives}`, 208, 16);
	ctx.fillText(`SCORE: ${score}`, 208, 32);
}

setCursorPos();
drawInterval = setInterval(draw, 16); // 16ms = 60fps
newblock = setInterval( () => {
	if (blocks.length == 13) {
		clearInterval(drawInterval);
		clearInterval(newblock);
		ctx.fillText('GAME OVER', 208, 48);
	}

	if (framesCount == 180) { // Add new line every 3 seconds
		framesCount = 0;
		newLine = [0,0,0,0,0,0,0,0,0,0];

		for (i=0; i < Math.floor(Math.random() * (8 - 4)) + 4; i++) {
			newLine[i] = 1;
		}

		newLine = randomArray(newLine);
		blocks.push(newLine);
	} else {
		framesCount++;
	}
}, 16);

document.addEventListener('keydown', function(e) {
	if (e.repeat) return;

	if ((e.key == 'ArrowLeft' || e.key == 'Left') && ship.pos > 0) {
		ship.posx -= 16;
		cursor.posx -= 16;
		ship.pos--;
		setCursorPos();
	}

	if ((e.key == 'ArrowRight' || e.key == 'Right') && ship.pos < 9) {
		ship.posx += 16;
		cursor.posx += 16;
		ship.pos++;
		setCursorPos();
	}

	if (e.key == 'z') {
		shot();
	}
});