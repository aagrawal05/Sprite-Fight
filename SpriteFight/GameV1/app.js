const hostname = "10.190.21.192."
const Char = 'DragonBoi'
const Chars = {
  DragonBoi:{
    Anims:{    
      IDLE:{
        frames:9,
        width:64,
        height:68,
        imgsrc:"/Animations/"+Char+"/IDLE.png"
      },
      FLY:{
        frames:13,
        width:64,
        height:68,
        imgsrc:"/Animations/"+Char+"/FLY.png"
      },
      ATK:{
        frames:9,
        width:80,
        height:68,
        imgsrc:"/Animations/"+Char+"/ATK.png"
      },
      MOVE:{
        frames:9,
        width:64,
        height:72,
        imgsrc:"/Animations/"+Char+"/MOVE.png"
      },
      ULTI:{
        frames:16,
        width:76,
        height:64,
        imgsrc:"/Animations/"+Char+"/ULTI.png"
      }
    },
    jumpForce:30,
    spd:0.5,
    hp:100,
    reload:1,
    min:15,
    max:50,
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
var flooroffset = 170;
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
io.sockets.on('connection',newConnection);
function newConnection(socket){
    console.log('New connection from ' + socket.request.connection.remoteAddress);
    Players.push({
        IP:socket.request.connection.remoteAddress,
        ID:socket.id,
        imgsrc:Chars[Char].Anims['ATK'].imgsrc,
        dir:true,
        spd:Chars[Char].spd,
        frame:0,
        frames:Chars[Char].Anims["ATK"].frames,
        width:Chars[Char].Anims["ATK"].width,
        height:Chars[Char].Anims["ATK"].height,
        jumping:true,
        jumpForce:Chars[Char].jumpForce,
        x:canvsize.width/2, // center of the canvas
        x_velocity:0,
        y:0,
        y_velocity:0,
        hp:Chars[Char].hp,
        points:0,
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
             IND = i;
          break;
        }
      }
      if (Players[IND].x_velocity>0||Players[ind].x_velocity<0){
        Players[IND].frames = Chars[Char].Anims["MOVE"].frames;
        Players[IND].width = Chars[Char].Anims["MOVE"].width;
        Players[IND].height = Chars[Char].Anims["MOVE"].height;
        Players[IND].imgsrc = Chars[Char].Anims["MOVE"].imgsrc;
      } else {
        Players[IND].frames = Chars[Char].Anims["IDLE"].frames;
        Players[IND].width = Chars[Char].Anims["IDLE"].width;
        Players[IND].height = Chars[Char].Anims["IDLE"].height;
        Players[IND].imgsrc = Chars[Char].Anims["IDLE"].imgsrc;
      }
      if (data.Ctl.atk && Players[ind].canAttack){
        Players[IND].frames = Chars[Char].Anims["ATK"].frames;
        Players[IND].width = Chars[Char].Anims["ATK"].width;
        Players[IND].height = Chars[Char].Anims["ATK"].height;
        Players[IND].imgsrc = Chars[Char].Anims["ATK"].imgsrc;
      } if (Players[IND].y<flooroffset){
        Players[IND].frames = Chars[Char].Anims["FLY"].frames;
        Players[IND].width = Chars[Char].Anims["FLY"].width;
        Players[IND].height = Chars[Char].Anims["FLY"].height;
        Players[IND].imgsrc = Chars[Char].Anims["FLY"].imgsrc;
      Players[IND].frame = ++Players[ind].frame%Players[ind].frames;
    }
  }  
}
setInterval(SEND,FPS);
function SEND(){
    io.sockets.emit('UPDATE', Players);
}
