// Intruder
var theObject = document.querySelector('#mainObject');
var initialLeft;
var initialTop;
var container = document.querySelector('#field');
var requestId;
var theObjectRadius = 12;

container.addEventListener('click', getClickPosition, false);

function animate({timing, draw, duration}) {

    let start = performance.now();

    requestId = requestAnimationFrame(function animate(time) {
        // timeFraction changing from 0 to 1
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;

        // calculation of current state of animation
        let progress = timing(timeFraction);

        let stop = draw(progress);
        if (!stop) {
            requestId = undefined;
            return;
        }

        if (timeFraction < 1) {
            requestId = requestAnimationFrame(animate);
        } else {
            requestId = undefined;
        }

    });


}

function getClickPosition(e) {
    let startBtn = document.querySelector("#start"); 
	// Do nothing, if start button hasn't been clicked and hasn't changed it's value to 'Pause'
	if (startBtn === undefined || startBtn.value === 'Start')
        return
        
    if (!theObject) {
        theObject = document.querySelector('#mainObject');
        initialLeft = theObject.getBoundingClientRect().left - theObject.getBoundingClientRect().width / 2;
        initialTop = theObject.getBoundingClientRect().top - theObject.getBoundingClientRect().height / 2;
    }
    if (requestId) {
        cancelAnimationFrame(requestId);
        const left = theObject.getBoundingClientRect().left;
        const top = theObject.getBoundingClientRect().top;
        theObject.style.transform = '';
        theObject.style.left = left + 'px';
        theObject.style.top = top + 'px';
    }

    var parentPosition = getPosition(container);
    let elementPos = {'x': theObject.getBoundingClientRect().left, 'y': theObject.getBoundingClientRect().top};

    var xPosition = e.clientX - (theObject.offsetWidth / 2) -
        elementPos.x;
    var yPosition = e.clientY - (theObject.offsetHeight / 2) -
        elementPos.y;

    const length = Math.sqrt(xPosition * xPosition + yPosition * yPosition);
    console.log("length", length);
    animate({
        //duration of animation (velocity of intruder)
        duration: length * 2,
        //changes of value - progress
        timing: (timeFraction) => {
            // return timeFraction;
            return Math.pow(timeFraction, 2);
        },
        // draw develops by a cycle untill progress <= 1
        draw: (progress) => {

            theObject.style.transform = tranlsate3dValue;
            var tranlsate3dValue = "translate3d(" + ((xPosition * progress)) + "px," + ((yPosition * progress)) + "px, 0)";

            console.log("tranlsate3dValue",tranlsate3dValue);
            theObject.style.transform = tranlsate3dValue;

            if (progress > 0.99) {
                theObject.style.left = theObject.getBoundingClientRect().left - initialLeft + 'px';
                theObject.style.top = theObject.getBoundingClientRect().top - initialTop + 'px';
                theObject.style.transform = '';


                // console.log("BoundingClientRect",theObject.getBoundingClientRect().left, theObject.getBoundingClientRect().top);
                return false;


            } else {
                requestId = undefined;
            }
            return true;


        }
    });


}

function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;

    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return {
        x: xPosition,
        y: yPosition
    };
}

// Simulation UAVs
class UAV {
  constructor(id, x, y, angle, speed, field) {
    this.id = id;
    this.obj = document.querySelector("#uav"+id);
    this.obj.style.position = "absolute";
    this.angleini = angle;
    this.angle = angle;
    this.xini = x;
    this.yini = y;
    this.x = x;
    this.y = y;
    this.update();
    this.speed = speed;
    this.up_bound = 2 * Math.PI;
    this.low_bound = -this.up_bound;
    this.border = Math.max(this.obj.clientHeight / 2, this.obj.clientWidth / 2)
    this.field = field;
    this.height = this.field.clientHeight - this.border;
    this.width = this.field.clientWidth - this.border;
    this.index = 0;
    this.radius = 15;
  }

  reset() {
    this.x = this.xini;
    this.y = this.yini;
    this.angle = this.angleini;
    this.update();
  }

  update() {
    this.obj.style.top = this.y - (this.obj.clientHeight / 2) + 'px';
    this.obj.style.left = this.x - (this.obj.clientWidth / 2) + 'px';
  }

  move(offset, uavs) {
    this.angle += offset;
    if (this.angle > this.up_bound) {
        this.angle -= this.up_bound;
    } else if (this.angle < this.low_bound) {
        this.angle += this.low_bound;
    }
    let xx = Math.cos(this.angle) * this.speed;
    let yy = Math.sin(this.angle) * this.speed;
    this.x = Math.max(this.border, Math.min(this.width, this.x + xx));
    this.y = Math.max(this.border, Math.min(this.height, this.y + yy));
    this.update();
    //console.log(this.angle + " " + this.x + "," + this.y);
    // bouncing from borders
    if (this.x <= this.border || this.x >= this.width || this.y <= this.border || this.y >= this.height) {
        this.angle = this.angle + Math.PI;
    }

    // collision
	for (let i = 0; i < uavs.length; i++) {
		if (uavs[i] != null && this !== uavs[i]) { // not to process itself
			let dx = this.x - uavs[i].x;
			let dy = this.y - uavs[i].y;
			let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			let margin = 15;

			if (distance < this.radius * 2 + margin) {
				this.angle = this.angle + Math.PI;
			//	this.obj.style.border = '1px solid red';
			}
		}
    }
    // if Intruder is detected by UAVs, the simulation is over
    let Indx = theObject.xPosition - uavs[i].x;
    let Indy = theObject.yPosition - uavs[i].y;
    let InDistance = Math.sqrt(Indx * Indx + Indy * Indy);

    if (InDistance < theObjectRadius + this.radius) {
        alert("Simulation is over.");
        clearInterval(timer); // finish the animation
        combo.disabled = false;
        btn.disabled = true;
        return;
    }
  }
}



const speed = 10;
const space = 30;
const PI = Math.PI;
const PI_2 = PI / 2;
const PI_4 = PI / 4;
const PI_34 = 3 * PI_4;

const init1  = [[ 0,  0, 0]];
const init2  = [[-1,  0, PI], [1, 0, 0]];
const init4  = [[-1, -1, -PI_34], [1, -1, -PI_4], [-1, 1, PI_34], [1, 1, PI_4]];
const init8  = [[-1, -1, -PI_34], [1, -1, -PI_4], [-1, 1, PI_34], [1, 1, PI_4],
                [-3, -1, PI],     [3, -1, 0],     [-3, 1, PI],    [3, 1, 0]];
const init12 = [[-1, -1, -PI_34], [1, -1, -PI_4], [-1, 1, PI_34], [1, 1, PI_4],
                [-3, -1, PI],     [3, -1, 0],     [-3, 1, PI],    [3, 1, 0],
                [-1, -3, -PI_2],  [1, -3, -PI_2], [-1, 3, PI_2],  [1, 3, PI_2]];
const init16 = [[-1, -1, -PI_34], [1, -1, -PI_4], [-1, 1, PI_34], [1, 1, PI_4],
                [-3, -1, PI],     [3, -1, 0],     [-3, 1, PI],    [3, 1, 0],
                [-1, -3, -PI_2],  [1, -3, -PI_2], [-1, 3, PI_2],  [1, 3, PI_2],
                [-3, -3, -PI_34], [3, -3, -PI_4], [-3, 3, PI_34], [3, 3, PI_4]];
const inits = [[], init1, init2, [], init4, [], [], [], init8, [], [], [], init12, [], [], [], init16];

let uavs = new Array(16);
let timer;
const offset = Math.PI / 4;
let btn = document.querySelector('#start');
let combo = document.querySelector('#uavNumSelector');
let timelabel = document.querySelector('#timelabel');

btn.addEventListener('click', function() {
    combo.disabled = true;
    btn.value = (btn.value == 'Start' ? 'Pause' : 'Start');
    if (btn.value == 'Pause') {
        let start = Date.now(); // remember start time
		console.log("let the party begin");
		console.log("uavs: ", uavs);

        timer = setInterval(function() {
        // how much time passed from the start?
        let timePassed = (Date.now() - start) / 100;
        updateTimeLabel(timePassed);

        if (timePassed >= 600) {
            clearInterval(timer); // finish the animation
            combo.disabled = false;
            btn.disabled = true;
            return;
        }

        // draw the animation at the moment timePassed
        draw(timePassed);

        }, 50);
    } else {
        clearInterval(timer);
    }
})


function resetDefaultPos() {
    for (i = 0; i < uavs.length; i++) {
        if (uavs[i] != null) {
            uavs[i].reset();
        }
    }
    clearInterval(timer);
    updateTimeLabel(0);
    combo.disabled = false;
    btn.disabled = false;
    btn.value = 'Start';
}

function draw(timePassed) {
    for (i = 0; i < uavs.length; i++) {
        if (uavs[i] != null) {
			console.log(`uav_${i} position is being updated, uav object: `);
			console.log(uavs[i]);
            let rho = Math.random(); // To be replaced by chaotics
            if (rho < 0.333333) {
                // right
                uavs[i].move(offset, uavs);
            } else if (rho < 0.666666) {
                // left
                uavs[i].move(-offset, uavs);
            } else {
                // ahead
                uavs[i].move(0, uavs);
            }
        }
    }
}

function setNumUavs(selectorVal) {
    let field = document.getElementById("field");
    field.innerHTML = "<div id=mainObject></div>";
    let x = field.clientWidth / 2;
    let y = field.clientHeight / 2;
    let init = inits[selectorVal];

    for (i = 0; i < selectorVal; i++) {
        uavs[i] = null;
    }

    for (i = 0; i < selectorVal; i++) {
        let uavImg = document.createElement("img");
        uavImg.src = "prototype/uav.png";
        uavImg.className = "uav";
        uavImg.width = "30";
        uavImg.height = "30";
        uavImg.id = "uav"+i;
        uavImg.title = i;
        field.appendChild(uavImg);
        uavs[i] = new UAV(i, x+(space*init[i][0]), y+(space*init[i][1]), init[i][2], speed, field);
    }
	console.log(`${selectorVal} uavs successfully initialized`);
}

function updateTimeLabel(time) {
    str = "0000" + Math.trunc(time).toString();
    timelabel.value = str.substr(str.length-4);
}

function init() {
    combo.selectedIndex = 0;
    setNumUavs(1);
    resetDefaultPos();
}
