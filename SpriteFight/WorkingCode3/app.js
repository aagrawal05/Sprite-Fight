const hostname = "10.190.19.37"
const Char = 'DragonBoi'
const Chars = {
  DragonBoi:{
    Idleframes:9,
    Moveframes:9,
    width:64,
    height:68,
    atkwidth:22,
    atkheight:16
  }
}
var canvsize = {
    width : 1080,
    height : 720
}
var ind;
var fps = 60;
var FPS = 1000/fps;
var flooroffset = 64;
var grav = 0.5;
var friction = 0.9;
var Players = [];
const express = require('express');
const app = express();
const server = app.listen(80);
app.use(express.static('public'));
app.set('port', process.env.HOST || hostname);
const socket = require('socket.io');
const io = socket(server);
console.log("Server working @ " + hostname);
io.sockets.on('connect',newConnection);
function newConnection(socket){
    Players.push({
        ID:socket.id,
        imgsrc:"http://"+hostname+"/Animations/"+Char+".png",
        CUTY:0,
        dir:true,
        spd:0.5,
        frame:0,
        frames:1,
        height:Chars[Char].height,
        jumping:true,
        jumpForce:100,
        width:Chars[Char].width,
        x:canvsize.width/2, // center of the canvas
        x_velocity:0,
        y:0,
        y_velocity:0});

    console.log("New Connection @ " + socket.id + "\nPlayers: " + JSON.stringify(Players));
    socket.on('disconnect',disConnect);
    function disConnect(){
        for(var i = 0; i<Players.length; i++){
          if(Players[i].ID == socket.id){
            Players.splice(i,1);
            break;
          }
        }
        console.log(socket.id + " Has Disconnected \nPlayers: " + JSON.stringify(Players));
    } 
    socket.on("update",update);
    function update(data){
          for(var i = 0; i<Players.length; i++){
            if(Players[i].ID == data.ID){
              ind = i;
              break;
            }
          }
          Players[ind].dir = data.Ctl.dir;
          if (data.Ctl.up && Players[ind].jumping == false) {
            Players[ind].y_velocity -= Players[ind].jumpForce;
            Players[ind].jumping = true;
          }
          if (data.Ctl.left) {
            Players[ind].x_velocity -= Players[ind].spd;   
          }
          if (data.Ctl.right) {
            Players[ind].x_velocity += Players[ind].spd;        
          }
          Players[ind].y_velocity += grav;// gravity
          Players[ind].x += Players[ind].x_velocity;
          Players[ind].y += Players[ind].y_velocity;
          Players[ind].x_velocity *= friction;// friction
          Players[ind].y_velocity *= friction;// friction
          // if Players[ind].Rectangle is falling below floor line
          if (Players[ind].y > canvsize.height - flooroffset - Players[ind].height) {
            Players[ind].jumping = false;
            Players[ind].y = canvsize.height - flooroffset - Players[ind].height;
            Players[ind].y_velocity = 0;
          }
        
       
          // if Players[ind].Rectangle is going off the left of the screen
          if (Players[ind].x < -Players[ind].width) {
        
            Players[ind].x = canvsize.width;
        
          } else if (Players[ind].x > canvsize.width) {// if Players[ind].Rectangle goes past right boundary

            Players[ind].x = -Players[ind].width;

          } 
    }
    socket.on("updateFrame",updateFrame);
    function updateFrame(data){
      for(var i = 0; i<Players.length; i++){
        if(Players[i].ID == data.ID){
          ind = i;
          break;
        }
      }
      if (data.Ctl.right||data.Ctl.left){
        Players[ind].CUTY = 0;
        Players[ind].frames = 9;
      } else if (Players[ind].jumping){
        Players[ind].CUTY = 0;
        Players[ind].frames = 1;
      } else {
        Players[ind].CUTY = 0;
        Players[ind].frames = 9;
      }
      Players[ind].frame = ++Players[ind].frame%Players[ind].frames;
    }
}
setInterval(SEND,FPS);
function SEND(){
    io.sockets.emit('UPDATE', Players);
}