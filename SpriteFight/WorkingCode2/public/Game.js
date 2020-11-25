const hostname = "192.168.1.68"
const socket = io.connect("http://"+hostname+"/");
var context, controller, rectangle, cutx, cuty;
context = document.querySelector("canvas").getContext("2d");
canvsize = {
  height:720,
  width:1080
}
var fps = 60;
var FPS = 1000/fps;
var flooroffset = 64;

context.canvas.height = canvsize.height;
context.canvas.width = canvsize.width;
window.resizeTo(canvsize.width,canvsize.height);
var Image = new Image();
Image.src = "http://"+hostname+"//Animations/DragonBoiTest.png"
controller = {
  
  left:false,
  right:false,
  up:false,
  dir:-1,
  keyListener:function(event) {

    var key_state = (event.type == "keydown")?true:false;

    switch(event.keyCode) {

      case 37:// left key
        if(!key_state){
          lastDir = 1;
        }
        controller.dir = key_state?-1:-lastDir;
        controller.left = key_state;
      break;
      case 65: //or key a
        if(!key_state){
          lastDir = 1;
        }
        controller.dir = key_state?-1:-lastDir;
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
        if(!key_state){
          lastDir = -1;
        }
        controller.dir = key_state?1:-lastDir;
        controller.right = key_state;
      break;
      case 68:
        if(!key_state){
          lastDir = -1;
        }
        controller.dir = key_state?1:-lastDir;
        controller.right = key_state;
      break; // d key
    }
  }
};
window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener);

setInterval(SendUpdate,FPS);
function SendUpdate(){
  socket.emit("update",{Ctl: controller, ID:socket.id})
}
socket.on("UPDATE",draw)
function draw(data){
  context.clearRect(0,0,canvsize.width,canvsize.height);  
  context.fillStyle = "#202020";
  context.fillRect(0, 0, canvsize.width, canvsize.height);// x, y, width, height
  context.fillStyle = "#ff0000";
  for(var i = 0; i<data.length; i++){
    data[i].frame = (++data[i].frame)%(data[i].frames+1);
    cutx = data[i].frame*64;
    cuty = 0;
    console.log(data[i].dir);// + " " + data[i].frame);
    if (data[i].dir == 1){
      context.translate(data[i].x,data[i].y);    
    } else {
      context.translate(data[i].x+data[i].width,data[i].y);    
    }
    context.scale(data[i].dir,1);
    context.drawImage(Image,cutx,cuty,data[i].width,data[i].height,0,0,data[i].width,data[i].height);
    context.setTransform(1,0,0,1,0,0);
  }

  context.strokeStyle = "#202830";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, canvsize.height-flooroffset);
  context.lineTo(canvsize.width, canvsize.height-flooroffset);
  context.stroke();
}