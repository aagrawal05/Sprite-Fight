const hostname = "localhost";
const socket = io.connect("http://"+hostname+"/");
const Char = "DragonBoi";
var context, controller, rectangle, cutx, cuty;
context = document.querySelector("canvas").getContext("2d");
canvsize = {
  width:1080,
  height:720
}
var framerate = 24;
var frameRate = 1000/framerate;
var fps = 60;
var FPS = 1000/fps;
var flooroffset = 64;
var lastdir = 1;
context.canvas.height = canvsize.height;
context.canvas.width = canvsize.width;
window.resizeTo(canvsize.width,canvsize.height);
var image = new Image();
var AtkImage = new Image();
controller = {
  left:false,
  right:false,
  up:false,
  atk:false,
  keyListener:function(event) {

    var key_state = (event.type == "keydown")?true:false;

    switch(event.keyCode) {

      case 37:// left key
        controller.left = key_state;
      break;
      case 65: //or key a
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
        controller.right = key_state;
      break;
      case 68:// d key
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
  for(var i = 0; i<data.length; i++){
    if (data[i].ID == socket.id){
      var ind = i;
      break;
    }
  }
  context.clearRect(0,0,canvsize.width,canvsize.height);//Clear the screen  
  //Temp
  context.fillStyle = "#202020";
  context.fillRect(0, 0, canvsize.width, canvsize.height);// Background 
  context.strokeStyle = "#202830";
  context.lineWidth = 7.5;
  context.beginPath();
  context.moveTo(0, canvsize.height-flooroffset);
  context.lineTo(canvsize.width, canvsize.height-flooroffset);
  context.stroke();
  
  if(data[ind].canAttack){
    AtkImage.src = "Attack.png"
  } else if (!data[ind].canAttack){
    AtkImage.src = "noAttack.png"
  }
  context.drawImage(AtkImage,150,canvsize.height-125,100,100);
  for(var i = 0; i<data.length; i++){//Update the Screen in terms of Players
      image.src = data[i].imgsrc
// Draw the character and flip him if necessary 
      context.translate(data[i].x+data[i].width,data[i].y)
      context.scale(data[i].dir?1:-1,1);
      cutx = data[i].frame*data[i].width;
      cuty = data[i].CUTY*data[i].height;
      context.drawImage(image,cutx,cuty,data[i].width,data[i].height,data[i].dir?-data[i].width:0,0,data[i].width,data[i].height);
      context.setTransform(1,0,0,1,0,0);
//Draw the hp relative to the player
      context.font = "30px Impact";
      context.fillStyle = "white"
      context.fillText(data[i].hp.toString(),data[i].x+data[i].width/4,data[i].y-15);
      context.strokeStyle = "black";
      context.lineWidth = 3;
      context.strokeText(data[i].hp.toString(),data[i].x+data[i].width/4,data[i].y-15);
  }
}