//获取元素
//画布
var mapCanvas = document.getElementById("map");
//加载项
var loadingDiv = document.getElementById("loading");
//结束菜单
var menuDiv = document.getElementById("menu");
//结束菜单分数
var endScoreLi = document.getElementById("endScore");
//重新开始按钮
var restartBtn = document.getElementById("restart");
//左上角分数
var scoreSpan = document.querySelector("#score span");

//获取画笔对象
var content = mapCanvas.getContext("2d");

//设置画布尺寸
mapCanvas.width = window.innerWidth;
mapCanvas.height = window.innerHeight;

//预加载
//创建一个数组存储图片名称
var imageNames = ["background.png", "bullet1.png", "bullet2.png", "enemy1.png", "enemy2.png", "enemy3.png", "herofly.png", "prop.png"];

//声明一个计数器
var count = 0;
//声明一个数组存储图片对象
var images = [];
for(var i = 0; i < imageNames.length; i++) {
    var img = new Image();
    img.src = "img/" + imageNames[i];
    images.push(img);
    img.onload = function() {
        count++;
        if(count == imageNames.length) {
            console.log("图片加载完毕");
            //预加载音频
            loadMusic();
        }
    }
}
//声明数组存储音频名字
var musicName = ["bullet.mp3", "enemy1_down.mp3", "enemy2_down.mp3", "enemy3_down.mp3", "game_music.mp3", "game_over.mp3"];
//声明计数器
var count1 = 0;
//声明一个数组存储音频对象
var musics = [];
//加载音频的函数
function loadMusic() {
    for(var i = 0; i < musicName.length; i++) {
        var music = new Audio();
        music.src = "audio/" + musicName[i];
        musics.push(music);
        music.onloadedmetadata = function() {
            count1++;
            if(count1 == musicName.length) {
                console.log("音频加载完毕");
                //隐藏加载项
                loadingDiv.style.display = "none";
                //播放音乐
                musics[4].loop = true;
                //volume 音量, 范围0-1
                musics[4].volume = 0.5;
                musics[4].play();
                //开始游戏
                main();
            }
        }
    }
}
//背景对象, 只需要一个
var backgrond = {
    //属性
    width: mapCanvas.width,
    height: mapCanvas.height,
    x: 0,
    y: 0,
    //方法
    //绘制方法
    draw: function() {
        //计算一屏需要多少张背景图铺满
        var row = Math.ceil(mapCanvas.height / 568);
        var col = Math.ceil(mapCanvas.width / 320);
        console.log(row, col);
        for(var i = -row; i < row; i++) {
            for(var j = 0; j < col; j++) {
                content.drawImage(images[0], j * 320, i * 568 + this.y);
            }
        }
    },
    //移动方法
    move: function() {
        this.y++;
        var row = Math.ceil(mapCanvas.height / 568);
        if(this.y >= 568 * row) {
            this.y = 0;
        }
    }
};

//英雄对象
var hero = {
    //属性
    //位置
    x: mapCanvas.width / 2 - 33,
    y: mapCanvas.height - 82 - 50,
    //宽高
    width: 66,
    height: 82,
    //第几张图片, 从0开始
    i: 0,
    //存储发射出去的子弹
    bullets: [],
    //子弹的类型 (0--单排, 1--双排)
    bulletType: 0,
    //是否爆炸
    boom: false,
    //图片的切换频率
    flagI: 0,
    //子弹的发射频率
    flagShot: 0,
    //方法
    //绘制方法
    draw: function() {
        //控制图片的切换频率
        this.flagI++;
        if(this.flagI == 5) {
            //判断是否爆炸
            if(this.boom) {
                this.i++;
                if(this.i == 4) {
                    //游戏结束
                            	   	  	 gameOver();
                }
            } else {
                //继续换图
                //      	       this.i = (this.i == 1) ? 0 : 1;
                this.i = (++this.i) % 2;
            }
            //重置切换频率
            this.flagI = 0;
        }
        //将英雄图片的一部分绘制到画布上.
        content.drawImage(images[6], this.width * this.i, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    },
    //发射子弹的方法
    shot: function() {
        //如果英雄已经爆炸, 不需要发射子弹,如果不爆炸, 增加发射频率
        if(!this.boom) {
            this.flagShot++;
        }
        if(this.flagShot == 5) {
            //播放发射子弹音频
            musics[0].play();
            //创建子弹对象
            if(this.bulletType) {
                //双排
                var bullet = new Bullet(this.x + this.width / 2 - 24, this.y - 14, 48, 14, images[2], 2);
            } else {
                //单排
                var bullet = new Bullet(this.x + this.width / 2 - 3, this.y - 14, 6, 14, images[1], 1);
            }
            //保存发射出来的子弹
            this.bullets.push(bullet);
            //重置发射频率
            this.flagShot = 0;
        }
        //处理每一个子弹对象
        for(var i = 0; i < this.bullets.length; i++) {
            //判断子弹是否飞出屏幕
            if(this.bullets[i].y <= -this.bullets[i].height) {
                //从数组里移除
                this.bullets.splice(i, 1);
                i--;
            } else {
                this.bullets[i].draw();
                this.bullets[i].move();
            }
        }
    }
}

//鼠标控制英雄移动
mapCanvas.onmousedown = function(e) {
    var even = e || event;
    //获取鼠标的按下位置
    var x = even.offsetX;
    var y = even.offsetY;
    //判断按下位置是否在英雄的范围内
    if(x < hero.x + hero.width && x > hero.x && y < hero.y + hero.height && y > hero.y) {
        //给画布绑定鼠标移动事件
        mapCanvas.onmousemove = function(e) {
            var even = e || event;
            //更新英雄的位置
            hero.x = even.offsetX - hero.width / 2;
            hero.y = even.offsetY - hero.height / 2;
        }
    }
}
//绑定鼠标抬起事件
mapCanvas.onmouseup = function() {
    this.onmousemove = null;
}

mapCanvas.ontouchstart = function(e) {
    var even = e || event;
    even.preventDefault();
    var x = even.touches[0].clientX;
    var y = even.touches[0].clientY;
    if(x < hero.x + hero.width && x > hero.x && y < hero.y + hero.height && y > hero.y) {
        mapCanvas.ontouchmove = function(e) {
            var even = e || event;
            even.preventDefault();
            hero.x = even.touches[0].clientX - hero.width / 2;
            hero.y = even.touches[0].clientY - hero.height / 2;
        }
    }
}
mapCanvas.ontouchend = function() {
    this.ontouchmove = null;
}

/*
 * 子弹类
 */
//子弹的构造函数
function Bullet(x, y, width, height, img, hurt) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    this.hurt = hurt;
}
//绘制方法
Bullet.prototype.draw = function() {
    content.drawImage(this.img, this.x, this.y, this.width, this.height);
}
//移动方法
Bullet.prototype.move = function() {
    this.y -= 5;
}

/*
 * 敌机类
 */
function Enemy(x, y, width, height, img, hp, speed, score, maxI) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    this.hp = hp; //血量
    this.speed = speed; //速度
    this.score = score; //分值
    this.i = 0; //控制第几张图片
    this.flagI = 0; //控制切换图片的频率
    this.boom = false; //是否爆炸
    this.isDie = false; //是否死亡
    this.maxI = maxI; //控制敌机换图的最大值
}
//绘制方法
Enemy.prototype.draw = function() {
    //判断是否爆炸
    if(this.boom) {
        //爆炸之后换图
        this.flagI++;
        if(this.flagI == 5) {
            this.i++;
            if(this.i == this.maxI) {
                //图片已经切换到最后一格, 敌机死亡
                this.isDie = true;
            }
            this.flagI = 0;
        }
    }
    //绘制
    content.drawImage(this.img, this.i * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
}
//移动方法
Enemy.prototype.move = function() {
    this.y += this.speed;
}

//声明一个数组存储画布上所有的敌机对象
var enemies = [];
//随机创建敌机的函数
function randomEnemy() {
    //控制敌机产生的速度
    var num = randomNumber(0, 1000);
    if(num < 50) {
        //创建敌机
        if(num <= 40) {
            //创建小飞机
            //随机位置
            var randomX = randomNumber(0, mapCanvas.width - 38);
            //随机速度
            var randomSpeed = randomNumber(3, 10);
            //x, y, width, height, img, hp, speed, score, maxI
            var e = new Enemy(randomX, -34, 38, 34, images[3], 1, randomSpeed, 100, 4);
        } else if(num <= 48) {
            //创建中飞机
            //随机位置
            var randomX = randomNumber(0, mapCanvas.width - 46);
            //随机速度
            var randomSpeed = randomNumber(3, 10);
            //x, y, width, height, img, hp, speed, score, maxI
            var e = new Enemy(randomX, -64, 46, 64, images[4], 2, randomSpeed, 200, 5);
        } else {
            //创建大飞机
            //随机位置
            var randomX = randomNumber(0, mapCanvas.width - 110);
            //随机速度
            var randomSpeed = randomNumber(3, 10);
            //x, y, width, height, img, hp, speed, score, maxI
            var e = new Enemy(randomX, -164, 110, 164, images[5], 3, randomSpeed, 300, 9);
        }
        //把创建好的敌机放进数组
        enemies.push(e);
    }
    //移动敌机
    for(var i = 0; i < enemies.length; i++) {
        //判断敌机是否死亡或者已经飞出画布
        if(enemies[i].y >= mapCanvas.height || enemies[i].isDie) {
            //移除敌机
            enemies.splice(i, 1);
            i--;
        } else {
            //绘制
            enemies[i].draw();
            enemies[i].move();
        }
    }
}
/*
 * 道具类
 */
//道具构造函数
function Prop(x, y, width, height, speed, type) {
    //属性
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.type = type; //道具类型 0-炸弹, 1-双排子弹
    this.isUsed = false; //道具是否被使用.
}
//绘制方法
Prop.prototype.draw = function() {
    //x, y, width, height, speed, type
    content.drawImage(images[7], this.type * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
}

//移动方法
Prop.prototype.move = function() {
    this.y += this.speed;
}

//声明一个数组存储所有道具
var props = [];
//随机产生道具的方法
function randomProps() {
    //控制道具产生的速度
    var num = randomNumber(0, 1000);
    if(num < 10) {
        var randomX = randomNumber(0, mapCanvas.width - 38);
        var randomSpeed = randomNumber(2, 10);
        var randomType = randomNumber(0, 1);
        //创建道具对象
        //  	   x, y, width, height, speed, type
        var p = new Prop(randomX, -68, 38, 68, randomSpeed, randomType);
        //放进道具数组
        props.push(p);
    }
    //移动道具
    for(var i = 0; i < props.length; i++) {
        if(props[i].y >= mapCanvas.height || props[i].isUsed) {
            //从数组里删除
            props.splice(i, 1);
            i--;
        } else {
            //绘制
            props[i].draw();
            props[i].move();
        }
    }
}

/*
 * 碰撞
 * 1.子弹与敌机
 * 2.英雄与敌机
 * 3.道具与英雄
 */
//检测两个对象是否碰撞
function crash(obj1, obj2) {
    //分别获取两个对象的上下左右的位置信息
    var left1 = obj1.x;
    var right1 = obj1.x + obj1.width;
    var top1 = obj1.y;
    var bottom1 = obj1.y + obj1.height;

    var left2 = obj2.x;
    var right2 = obj2.x + obj2.width;
    var top2 = obj2.y;
    var bottom2 = obj2.y + obj2.height;

    if(right1 < left2 || left1 > right2 || bottom1 < top2 || top1 > bottom2) {
        return false;
    } else {
        return true;
    }
}
//验证对应的对象是否发生碰撞
function verifyObj() {
    //子弹与敌机
    bulletAndEnemy();
    //英雄与敌机
    heroAndEnemy();
    //道具与英雄
    propAndHero();
}
//子弹与敌机
function bulletAndEnemy() {
    for(var i = 0; i < enemies.length; i++) {
        for(var j = 0; j < hero.bullets.length; j++) {
            //判断敌机是否已经爆炸
            if(enemies[i].boom) {
                break;
            }
            if(!crash(enemies[i], hero.bullets[j])) {
                continue;
            }
            /*
             * 发生碰撞
             * 1.掉血
             * 2.敌机是否该爆炸
             * 3.如果爆炸, 得分, 播放爆炸声音
             * 4.子弹消失
             */
            enemies[i].hp -= hero.bullets[j].hurt;
            if(enemies[i].hp <= 0) {
                enemies[i].boom = true;
                scoreSpan.innerHTML = scoreSpan.innerHTML - 0 + enemies[i].score;
                switch(enemies[i].score) {
                    case 100:
                        {
                            musics[1].play();
                            break;
                        }
                    case 200:
                        {
                            musics[2].play();
                            break;
                        }
                    case 300:
                        {
                            musics[3].play();
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }

            }
            //子弹消失
            hero.bullets.splice(j, 1);
            j--;
        }
    }
}
//英雄与敌机
function heroAndEnemy() {
    for (var i = 0; i < enemies.length; i++) {
         //判断敌机是否爆炸
         if (enemies[i].boom) {
         	continue;
         }
         //碰撞检测
         if (crash(hero, enemies[i])) {
         	hero.boom = true;
         }
    }
}
//声明一个变量存储延时器
var timeOut;
//道具与英雄
function propAndHero() {
    for (var i = 0; i < props.length; i++) {
    	    //判断英雄是否已经爆炸
    	    if (hero.boom) {
    	    	    break;
    	    }
    	    if (!crash(hero, props[i])) {
    	    	    continue;
    	    }
    	    /*
    	     * 碰撞
    	     * 1.判断道具的类型
    	     *     a.炸弹, 所有敌机爆炸
    	     *     b.子弹, 暂时切换为双排子弹
    	     * 2.道具消失
    	     * 
    	     */
    	    if (props[i].type) {
    	    	   //双排
    	    	   hero.bulletType = 1;
    	    	   clearTimeout(timeOut);
    	    	   timeOut = setTimeout(function(){
    	    	       hero.bulletType = 0;
    	    	   }, 5000);
    	    }else {
    	        //炸弹
    	        for (var j = 0; j < enemies.length; j++) {
    	        	      enemies[j].boom = true;
    	        	      //加分
    	        	      scoreSpan.innerHTML = scoreSpan.innerHTML - 0 + enemies[i].score;
    	        }
    	    }
    	    //道具消失
    	    props[i].isUsed = true;
    }
}
function gameOver() {
    //播放结束声音
    musics[5].play();
    //进行音乐停止
    musics[4].pause();
    //显示结束菜单
    menuDiv.style.display = "block";
    //修改菜单分数
    endScoreLi.innerHTML = scoreSpan.innerHTML;
}
//开始游戏
function main() {
    content.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    backgrond.draw();
    backgrond.move();
    hero.draw();
    hero.shot();
    randomEnemy();
    randomProps();
    verifyObj();
    window.requestAnimationFrame(main);
}
restartBtn.onclick = function(){
    location.reload();
}
function randomNumber(x, y) {
    return Math.floor(Math.random() * (y - x + 1) + x);
}