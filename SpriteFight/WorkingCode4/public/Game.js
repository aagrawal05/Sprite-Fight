const hostname = "localhost"
const socket = io.connect("http://"+hostname+"/");
const Char = "DragonBoi";
var context, controller, rectangle, cutx, cuty;
context = document.querySelector("canvas").getContext("2d");
canvsize = {
  height:720,
  width:1080
}
var framerate = 24;
var frameRate = 1000/framerate;
var fps = 60;
var FPS = 1000/fps;
var flooroffset = 64;
var dir;
var lastdir = 1;
context.canvas.height = canvsize.height;
context.canvas.width = canvsize.width;
window.resizeTo(canvsize.width,canvsize.height);
var Image = new Image();
controller = {
  left:false,
  right:false,
  up:false,
  dir:-1,
  atk:false,
  keyListener:function(event) {

    var key_state = (event.type == "keydown")?true:false;

    switch(event.keyCode) {

      case 37:// left key
        controller.dir = false;
        controller.left = key_state;
      break;
      case 65: //or key a
        controller.dir = false;
        controller.left = key_state;
      break;
      case 38:// space key
        controller.up = key_state;
      break;
      case 32: // or up key
       controller.up = key_state;
      break; 
      case 87: // or w key
        controller.up = key_state;
      break;
      case 39:// right key
        controller.dir = true;
        controller.right = key_state;
      break;
      case 68:// d key
        controller.dir = true;
        controller.right = key_state;
      break;
      case 88:
        controller.atk = key_state; 
      }
  }
};
window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener);

setInterval(SendUpdate,FPS);
function SendUpdate(){
  socket.emit("update",{Ctl: controller, ID:socket.id})
}
setInterval(UF,frameRate)
function UF(){
  socket.emit("updateFrame", {Ctl: controller, ID:socket.id})
}
socket.on("UPDATE",draw)
function draw(data){
  context.clearRect(0,0,canvsize.width,canvsize.height);  
  context.fillStyle = "#202020";
  context.fillRect(0, 0, canvsize.width, canvsize.height);// x, y, width, height
  context.fillStyle = "#ff0000";
  for(var i = 0; i<data.length; i++){
      Image.src = data[i].imgsrc
      context.translate(data[i].x+data[i].width,data[i].y)
      context.scale(data[i].dir?1:-1,1);
      cutx = data[i].frame*data[i].width;
      cuty = data[i].CUTY*data[i].height;
      context.drawImage(Image,cutx,cuty,data[i].width,data[i].height,data[i].dir?-data[i].width:0,0,data[i].width,data[i].height);
      context.font = "30px Impact";
      context.fillStyle = "white"
      context.setTransform(1,0,0,1,0,0);
      context.fillText(data[i].hp.toString(),data[i].x+data[i].width/4,data[i].y-15);
      context.strokeStyle = "black"
      context.strokeText(data[i].hp.toString(),data[i].x+data[i].width/4,data[i].y-15);

  }
  context.strokeStyle = "#202830";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, canvsize.height-flooroffset);
  context.lineTo(canvsize.width, canvsize.height-flooroffset);
  context.stroke();
}