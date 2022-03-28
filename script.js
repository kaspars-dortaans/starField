var starField = true;
var circleField = false;
var curField;

function run(){
	if(starField)
		curField = new StarField();
	else 
		curField = new CircleField();
	curField.run();
}

function menuChange(){
	curField.stop();
	if(document.getElementById("radio1").checked){
		starField = true;
		circleField = false;
	}
	else{
		starField = false;
		circleField = true;
	}
	run();
}

class Star{
	constructor(x, y, z){
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	screenx = 0
	screeny = 0
	
	calcScreenCoordinates(width, height){
		this.screenx = Math.round(map(this.x/this.z, 0,1, 0, width) + width/2);
		this.screeny = Math.round(map(this.y/this.z, 0,1, 0, height) + height/2);
		//console.log(this.screenx, this.screeny);
	}
}

class StarField {
	bgColor = "#111111"
	starColor = "#ffffff"
	canvas
	ctx
	stars = []
	starCap = 400
	speed = 15
	frameTarget = 1000/60
	width
	height
	depth
	runing = true;

	async run(){
		this.init();
  
		while(this.runing){
			//loop start time
			var now = new Date();
			//loop
			this.update();
			this.draw();
			//sleep if needed
			var elapsed = (new Date() - now);
			var sleepT = this.frameTarget - elapsed;
			if(sleepT > 0)await this.sleep(sleepT);
		}
	}
	
	stop(){
		this.runing = false;
	}
	
	init(){
		this.runing = true;
		
		//canvas
		this.canvas = document.getElementById("canvas");

		this.canvas.style.margin = "0px 0px 0px 0px";
		this.canvas.style.border = "0px 0px 0px 0px";

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.depth = this.width > this.height ? this.width : this.height;

		//2d context of canvas
		this.ctx = canvas.getContext("2d");
		
		for(var i = 0; i < this.starCap;i++){
			this.spawnStar();
		}
	}

	spawnStar(){
		this.stars.push(this.randStar(true));
	}

	randStar(randZ){
		var z = randZ ? randInBound(this.depth): this.depth;
		var x = randInBounds(-this.width/2, this.width/2);
		var y = randInBounds(-this.height/2, this.height/2);
		var star = new Star(x,y,z);
		star.calcScreenCoordinates(this.width, this.height);
		return star;
	}
	
	update(){
		//spawn missing stars
		while(this.stars.length < this.starCap){
			this.spawnStar();
		}
		
		//update star location
		this.stars.forEach((star) => {star.z -= this.speed});
			
		//remove stars which are outside of screen
		for(var i = 0; i < this.stars.length;i++){
			if(!(this.stars[i].screenx > 0 && this.stars[i].screenx < this.width && this.stars[i].screeny > 0 && this.stars[i].screeny < this.height)){
				this.stars[i] = this.randStar(false);
			}
		}
	}

	draw(){
		this.ctx.fillStyle = this.bgColor;
		this.ctx.fillRect(0,0,this.width,this.height);
		
		for(var i = 0; i < this.stars.length;i++){
			this.fillStar(this.ctx, this.stars[i]);
		}
	}

	sleep(ms){
		return new Promise(resolve => setTimeout(resolve,ms));
	}

	fillStar(ctx, star){
		this.ctx.strokeStyle = this.starColor;
		this.ctx.lineWidth = 1;
		
		this.ctx.beginPath();
		this.ctx.moveTo(star.screenx, star.screeny);
		star.calcScreenCoordinates(this.width, this.height);
		this.ctx.lineTo(star.screenx, star.screeny);
		this.ctx.stroke();
	}
}

function map(value, from1, to1, from2, to2){
	d1 = to1-from1;
	d2 = to2-from2;
	value /= d1;
	value *= d2;
	return value;
}	

function randInBound(bound){
  return Math.round(Math.random()*bound);
}

function randInBounds(from, to){
  return from + randInBound(to-from);
}

class Circle {
	constructor(x, y, r, color){
		this.x = x;
		this.y = y;
		this.r = r;
		this.color = color;
	}
}

class CircleField {
	bgColor = "#555555"
	canvas
	ctx
	circles = []
	circleCap = 50
	target = 1000/60
	minRad = 10
	running = true;

	async run(){
		this.init();
  
		while(this.running){
			//loop start time
			var now = new Date();

			//loop
			this.update();
			this.draw();

			//sleep if needed
			var elapsed = (new Date() - now);
			var sleepT = this.target - elapsed;
			if(sleepT > 0)await this.sleep(sleepT);
		}
	}
	
	stop(){
		this.running = false;
	}
	
	init(){
		this.running = true;
		
		//canvas
		this.canvas = document.getElementById("canvas");

		this.canvas.style.margin = "0px 0px 0px 0px";
		this.canvas.style.border = "0px 0px 0px 0px";

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.maxRad = Math.min(canvas.width, canvas.height)/10;

		//2d context of canvas
		this.ctx = canvas.getContext("2d");
	}

	spawnCircleById(id){
		this.circles[id] = this.randCircle();
	}

	spawnCircle(){
		this.circles.push(this.randCircle());
	}

	randCircle(){
		var r = randInBounds(this.minRad, this.maxRad);
		var x = r+ randInBound(this.canvas.width-r*2);
		var y = r+ randInBound(this.canvas.height-r*2);
		var color = "rgb("+ randInBound(255) +","+ randInBound(255) +","+ randInBound(255)+")";
		return new Circle(x,y,r, color);
	}
	
	update(){
		while(this.circles.length < this.circleCap){
			this.spawnCircle();
		}
		this.shrinkCircles();
		this.circles = this.circles.filter(circle => circle.r > 0);
	}

	shrinkCircles(){
		for(var i = 0; i < this.circles.length;i++){
			this.circles[i].r--;
			//if(circles[i].r <= 0)spawnCircleById(i);
		}
	}

	draw(){
		this.fillBg(this.ctx, this.canvas.width, this.canvas.height, this.bgColor);
		for(var i = 0; i < this.circles.length;i++){
			this.fillCircle(this.ctx, this.circles[i]);
		}
	}

	sleep(ms){
		return new Promise(resolve => setTimeout(resolve,ms));
	}

	fillBg(ctx, width, height, color){
		var prevFill = ctx.fillStyle;
		ctx.fillStyle = color;

		ctx.fillRect(0,0,width,height);

		ctx.fillStyle = prevFill;
	}

	fillCircle(ctx, circle){
		var prevFill = ctx.fillStyle;
		this.ctx.fillStyle = circle.color;

		this.ctx.beginPath();
		this.ctx.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI);//pars: center x, center y, circle radius, starting angle, ending angle
		this.ctx.fill();

		this.ctx.fillStyle = prevFill;
	}
}