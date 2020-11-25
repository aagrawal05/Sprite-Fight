var socket = io.connect('localhost');
var context, controller, rectangle, loop;
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

controller = {
  
  left:false,
  right:false,
  up:false,
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
      case 68:
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
    context.fillRect(data[i].x, data[i].y, data[i].width, data[i].height);
  }
  context.strokeStyle = "#202830";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, canvsize.height-flooroffset);
  context.lineTo(canvsize.width, canvsize.height-flooroffset);
  context.stroke();
}