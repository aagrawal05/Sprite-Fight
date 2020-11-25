const hostname = "localhost"
const Char = 'DragonBoi'
const Chars = {
  DragonBoi:{
    Idleframes:9,
    width:64,
    height:68,
    jumpForce:50,
    hp:100,
    reload:1,
    min:15,
    max:30,
    regenAmt:5,
    regenTimer:1
  }
}
var canvsize = {
    width : 1080,
    height : 720
}
var ind;
var fps = 24;
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
        jumping:false,
        jumpForce:Chars[Char].jumpForce,
        width:Chars[Char].width,
        x:canvsize.width/2, // center of the canvas
        x_velocity:0,
        y:0,
        y_velocity:0,
        hp:Chars[Char].hp,
        atk:false,
        points:0,
        deadTime:5,
        reloadTime:0,
        reloadTimer:Chars[Char].reload,
        canAttack:true,
        min:Chars[Char].min,
        max:Chars[Char].max,
        regenTime:0,
        regenAmt:Chars[Char].regenAmt,
        regenTimer:Chars[Char].regenTimer,
        isRegen:false
      });

socket.on('disconnect',disConnect);
function disConnect(){
        for(var i = 0; i<Players.length; i++){
          if(Players[i].ID == socket.id){
            Players.splice(i,1);
            break;
          }
        }
      } 
socket.on("update",update);
function update(data){
          for(var i = 0; i<Players.length; i++){
            if(Players[i].ID == data.ID){
              ind = i;
              break;
              }
            }
          if (Players[ind].x_velocity <= 0){
            Players[ind].dir = false;
          } else {
            Players[ind].dir = true;
          }
          if (!Players[ind].isRegen){
            Players[ind].regenTime++;
            if (Players[ind].regenTime >= Players[ind].regenTimer*FPS){
              Players[ind].hp += Players[ind].regenAmt;
              Players[ind].isRegen = false;
              Players[ind].regenTime = 0;
              if(Players[ind].hp > 100){
                Players[ind].hp = 100
              }
            }
          } 
          if (!Players[ind].canAttack){
            Players[ind].reloadTime++;
            if (Players[ind].reloadTime >= Players[ind].reloadTimer*FPS){
              Players[ind].canAttack = true;
              Players[ind].reloadTime = 0;
            }
          }
// If you are attacking and you can attack (reload)
          if (data.Ctl.atk && Players[ind].canAttack){
            Players[ind].canAttack = false;
            for(var i = 0; i<Players.length; i++){
              console.log(i+" "+ind);
              if (i == ind){
                continue;
// And if you are colliding with someone else
              } else if (Players[i].x < Players[ind].x + Players[ind].width &&
                         Players[i].x + Players[i].width > Players[ind].x &&
                         Players[i].y < Players[ind].y + Players[ind].height &&
                         Players[i].y + Players[i].height > Players[ind].y 
                         )
              {
//Then do damage
                Players[i].hp -= Math.ceil(Math.random() * (Players[ind].max-Players[ind].min+1)) + Players[ind].min;
              }
            }
          } 
          if (Players[ind].hp <= 0){
              //If they die respawn them, reset their points
              Players[i].points = 0;
              Players[ind].points++;
              Players[i].x = canvsize.width/2;
              Players[i].y = 0;
              Players[i].x_velocity = 0;
              Players[i].y_velocity = 0;
              Players[i].hp = 100;
          }
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