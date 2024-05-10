class Gallerygame extends Phaser.Scene {
    constructor() {
        super("gallerygame");
        this.my = {sprite:{}};
        this.yslots = [326,413,500,590];
        this.bodyX = 800;

        this.movingto = 1;
        this.bodyY = this.yslots[1];

        
        this.direction = 1;

        this.bullet = [];
        this.maxBullets = 30;
        this.bullettypes = ["sign_blue.png", "sign_red.png", "sign_street.png"];
        this.timer = 0;
        this.moving = false;
        this.current = 0;
        
        this.bulletdisplay =[];
        this.vehiclelist = ["convertible.png", "suv.png","truck.png"];
        //this.my.
        this.enemies = [];
        this.maxEnemies = 20;

        this.enemyspawns = [10,20,50];
        this.wave = 0;
        this.enemyspawner = 0;
        this.currenemy = 0;
        this.enemiesonscreen = true;

        this.movetimer = 0;
        this.enemymoving = false;
        this.enemytemp = {};
        this.enemymovingto = 0;
        this.enemydirection = 1;
        this.gameover = false;

        this.score = 0;
        this.text = "";
        this.wavetext = "";

        this.health = 3;
        this.iframe = 0;
        this.hearts = [];
        this.highscore = 0;
        this.wintext = "";
        
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("citytiles", "city_tilemap_packed.png");    // tile sheet   
        this.load.tilemapTiledJSON("map", "citymap.tmj");                   // Load JSON of tilemap
        this.load.atlasXML("spritesheet", "spritesheet_complete.png", "spritesheet_complete.xml");
        
        this.skey = this.input.keyboard.addKey("S");
        this.wkey = this.input.keyboard.addKey("W");
        this.spacekey = this.input.keyboard.addKey("SPACE");
        this.load.audio('carnoise', ["impactPunch_heavy_004.ogg" ]);
    }

    create() {
        this.sound = this.sound.add('carnoise', {loop: false});
        let my = this.my
        // Add a tile map
        // https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObjectFactory.html#tilemap__anchor
        // "map" refers to the key from load.tilemapTiledJSON
        // The map uses 16x16 pixel tiles, and is 10x10 tiles large
        this.map = this.add.tilemap("map", 16, 16, 10, 10);

        // Add a tileset to the map
        // First parameter: the name we gave to the tileset when it was added to Tiled
        // Second parameter: the key for the tilesheet (from this.load.image above)
        // https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tilemap.html#addTilesetImage__anchor
        this.tileset = this.map.addTilesetImage("city","citytiles");

        // Create a tile map layer
        // First parameter: name of the layer from Tiled
        // https://newdocs.phaser.io/docs/3.54.0/Phaser.Tilemaps.Tilemap#createLayer
        
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.detailsLayer = this.map.createLayer("details", this.tileset, 0, 0);
        this.detailsLayer.setScale(2.0);
        this.backgroundLayer.setScale(2.0);

        my.sprite.body = this.add.sprite(this.bodyX, this.bodyY, "spritesheet", "man.png");
        my.sprite.body.visible = true;

        my.sprite.throw = this.add.sprite(this.bodyX, this.bodyY, "spritesheet", "man_point.png");
        my.sprite.throw.visible = false;

        my.sprite.throw.flipX = true;
        my.sprite.throw.setScale(2.5);

        my.sprite.body.setScale(2.5);
        my.sprite.body.flipX = true;

        for(let type of this.bullettypes ){
            let newsprite = this.add.sprite(535,100,"spritesheet",type);
            newsprite.setScale(2.5);
            this.bulletdisplay.push(newsprite);
        }

        this.input.keyboard.on('keydown-W', (event) => {
            if(my.sprite.body.y > 350 && !this.moving){
            this.movingto--;
            this.moving = true;
            this.direction = -1;
            }
        });
        this.input.keyboard.on('keydown-S', (event) => {
            if(my.sprite.body.y < 550  && !this.moving){
            this.direction = 1;
            this.movingto++;
            this.moving = true;
            }
        });
        this.input.keyboard.on('keydown-M', (event) => {
            this.current++;
            if(this.current == 3){
                this.current = 0;
            }
            
        });
        this.input.keyboard.on('keydown-P', (event) => {
            this.gameover = false;
            
            

            if(this.score > this.highscore){
                this.highscore = this.score;
                this.highscoretext.setText("High Score: " + this.score);
            }
            
            
            for(let enemy of this.enemies){
                enemy.sprite.visible = false;
                enemy.sprite.destroy(true);
            }
            this.enemies = [];
            this.wave = 0;
            this.currenemy = 0;
            for(let i = 0; i < this.enemyspawns[this.wave]; i++){
                this.enemies.push({sprite:{}, health:this.wave * 100 + 100,slowed: false,hit: false});
            }
    
            for(let i = 0; i < this.enemyspawns[this.wave]; i++){
                let randnum = Math.floor(Math.random() * 4);
    
                let newsprite = this.add.sprite(0,this.yslots[randnum],"spritesheet",this.vehiclelist[this.enemies[i].health/100 - 1]);
                newsprite.visible = false;
                newsprite.setScale(2.5);
                this.enemies[i].sprite = newsprite;
            }
            for(let hearts of this.hearts){
                hearts.visible = false;
                
            }
            this.wintext.visible = false;
            this.hearts = [];
            this.health = 3;
            for(let i = 0; i < this.health;i++){
                this.hearts.push(this.add.sprite(875 - i * 40, 200, "spritesheet", "ambulance.png"));
            }
            this.gameovertext.visible = false;
            this.score = 0;
            this.text.setText("Score: "+ this.score);
            this.wavetext.setText("Wave " + this.wave);
        });
        for(let i = 0; i < this.enemyspawns[this.wave]; i++){
            this.enemies.push({sprite:{}, health:this.wave * 100 + 100,slowed: false,hit: false});
        }

        for(let i = 0; i < this.enemyspawns[this.wave]; i++){
            let randnum = Math.floor(Math.random() * 4);

            let newsprite = this.add.sprite(0,this.yslots[randnum],"spritesheet",this.vehiclelist[this.enemies[i].health/100 - 1]);
            newsprite.visible = false;
            newsprite.setScale(2.5);
            this.enemies[i].sprite = newsprite;
        }

        
        this.text = this.add.text(0, 0, 'Score: '+ this.score, { font: '40px "Press Start 2P"' });
        this.wavetext = this.add.text(0, 40, 'Wave: '+ (this.wave + 1), { font: '40px "Press Start 2P"' });

        this.gameovertext = this.add.text(250,200, 'Game Over, Press P to Restart', { font: '40px "Press Start 2P"' });
        this.highscoretext = this.add.text(650, 0, 'High Score: '+ localStorage.getItem("highscore"), { font: '40px "Press Start 2P"' });
        this.gameovertext.visible = false;
        for(let i = 0; i < this.health;i++){
            this.hearts.push(this.add.sprite(875 - i * 40, 200, "spritesheet", "ambulance.png"));
        }

        this.wintext = this.add.text(400,400, 'YOU WIN\npress P to play again', { font: '40px "Press Start 2P"' });
        this.wintext.visible = false;
    }
    checkcollision(){
        
        for(let enemy of this.enemies){
            for(let bullet of this.bullet){
                if(bullet.sprite.x <= enemy.sprite.x+10 && bullet.sprite.x >= enemy.sprite.x-10 && bullet.sprite.y <= enemy.sprite.y + 5 && bullet.sprite.y >= enemy.sprite.y - 5 && enemy.sprite.visible != false){
                    enemy.sprite.visible = false;
                    enemy.sprite.destroy(true);
                    if(bullet.type == 2){
                        enemy.health -= 40;
                        this.score += 4;
                        this.text.setText("Score: " + this.score);
                    }else if(bullet.type == 0){
                        if(enemy.health > 150 && enemy.health < 250){
                            enemy.health -= 100;
                        this.score += 10;
                            let temp = this.add.sprite(enemy.sprite.x,enemy.sprite.y,"spritesheet","convertible.png");
                            temp.setScale(2.5);
                            this.enemies.push({sprite:temp, health:100,slowed: true,hit: false});
                            console.log("yes");
                            bullet.sprite.visible = false;
                            bullet.sprite.destroy(true);
                            this.bullet.splice(this.bullet.indexOf(bullet),1);
                            let tempnum = enemy.health/100 - 1;
                    if(tempnum > 2){
                        tempnum = 2;
                    }
                    if(tempnum < 0){
                        tempnum = 0;
                    }

                    tempnum = Math.abs(Math.ceil(tempnum));
                    
                    let newsprite = this.add.sprite(enemy.sprite.x,enemy.sprite.y,"spritesheet",this.vehiclelist[tempnum]);
                    newsprite.setScale(2.5);
                    enemy.sprite = newsprite;
                    //this.enemies.splice(this.enemies.indexOf(enemy),1);
                    this.sound.play();
                            break;
                        }
                        enemy.health -= 100;
                        this.score += 10;
                        this.text.setText("Score: " + this.score);
                        bullet.sprite.visible = false;
                        bullet.sprite.destroy(true);
                        this.bullet.splice(this.bullet.indexOf(bullet),1);
                    }else if(!enemy.slowed){

                        enemy.slowed = true;
                        bullet.sprite.visible = false;
                        bullet.sprite.destroy(true);
                        this.bullet.splice(this.bullet.indexOf(bullet),1);
                    }
                    
                    let tempnum = enemy.health/100 - 1;
                    if(tempnum > 2){
                        tempnum = 2;
                    }
                    if(tempnum < 0){
                        tempnum = 0;
                    }

                    tempnum = Math.abs(Math.ceil(tempnum));
                    
                    let newsprite = this.add.sprite(enemy.sprite.x,enemy.sprite.y,"spritesheet",this.vehiclelist[tempnum]);
                    newsprite.setScale(2.5);
                    enemy.sprite = newsprite;
                    //this.enemies.splice(this.enemies.indexOf(enemy),1);
                    this.sound.play();
                    //("yes");
                    break;
                }
            }
        }
        
    } 
    randmove(){
        let tries = 0;
        let randnum = Math.floor(Math.random() * (this.currenemy));
        while((this.enemies[randnum].sprite.visible == false || this.enemies[randnum].sprite.x > 500) && this.enemiesonscreen == true ){
            if(tries >= 10 && this.enemies[randnum].sprite.x > 500){
                tries = 0;
                break;
            }
            tries++;
            randnum = Math.floor(Math.random() * (this.currenemy));
        }
        this.enemytemp = this.enemies[randnum];
        this.enemymoving = true;
        (this.enemytemp);

        if(this.enemies[randnum].sprite.y == this.yslots[0]){
            this.enemymovingto = this.yslots[1];
            this.enemydirection = 1;
            
        }else if(this.enemies[randnum].sprite.y == this.yslots[3]){
            this.enemymovingto = this.yslots[2];
            this.enemydirection = -1;
            
        }else if(this.enemies[randnum].sprite.y == this.yslots[2]){
            let coin = Math.pow(-1,Math.floor(Math.random()*2));
            ////(coin);
            this.enemymovingto = this.yslots[2 + coin];
            this.enemydirection = coin;
            
            
        }else if (this.enemies[randnum].sprite.y == this.yslots[1]){
            let coin = Math.pow(-1,Math.floor(Math.random()*2));
            ////(coin);
            this.enemymovingto = this.yslots[1 + coin];
            this.enemydirection = coin;
            
            
        }
        

        
    }
    
    checkhealth(){
        for(let enemy of this.enemies){
            if(enemy.health <= 0 && enemy.sprite.visible == true){
                enemy.sprite.visible = false;
                enemy.sprite.destroy(true);
                this.score += 5;
                this.text.setText("Score: " + this.score);
            }
        }
    }
    checkenemyplayercoll(){
        for(let enemy of this.enemies){
            if(this.iframe >= 40 && enemy.hit == false && enemy.sprite.visible == true && this.moving == false && this.my.sprite.body.x <= enemy.sprite.x+20 && this.my.sprite.body.x >= enemy.sprite.x-20 && this.my.sprite.body.y <= enemy.sprite.y + 5 && this.my.sprite.body.y >= enemy.sprite.y - 10){
                //("hit");
                this.iframe = 0;
                enemy.hit = true;
                this.health -= 1;
                if(this.hearts.length > 1){
                    this.hearts[this.hearts.length-1].visible = false;
                    this.hearts.splice(this.hearts.length-1);
                }else{
                    this.hearts[this.hearts.length-1].visible = false;
                    this.hearts.splice(this.hearts.length-1);
                    this.gameover = true;
                    this.gameovertext.visible = true;
                }
            }
        }
    }
    update() {
        
        ////(this.enemymovingto);
        ////(this.my.sprite);
        
        if(!this.gameover){
        this.iframe++;
        if(this.iframe < 40){
            if(this.iframe %5 == 0 && this.my.sprite.throw.visible == false){
                
                if(this.my.sprite.body.visible == true){
                    this.my.sprite.body.visible = false;
                }
                else if(this.my.sprite.body.visible == false){
                    this.my.sprite.body.visible = true;
                    
                }
                
            }
        }
        
       // //(this.enemytemp);
        this.checkenemyplayercoll();
        if(this.wave == 3){
            //print good job game over
            this.wintext.visible = true;
            this.gameover = true;
        }
        
        //console.log(this.movetimer);
        //console.log(this.enemymoving);
        this.movetimer++;
        if(this.movetimer >= 50 && !this.enemymoving){
            this.randmove();
            this.movetimer = 0;
            
        }
        
        //(this.enemytemp);
        if(!(this.enemytemp === undefined)){
            //("yes");
            //(this.enemytemp);
            //(this.enemymovingto);
        if(this.enemymoving && this.enemytemp.sprite.y < this.enemymovingto){
            
            this.enemytemp.sprite.y += 3 * 1;

        }else if(this.enemymoving && this.enemytemp.sprite.y > this.enemymovingto){
            
            this.enemytemp.sprite.y += 3 * -1;

        }
        else if(this.enemymoving && ((this.enemytemp.sprite.y >= this.enemymovingto && this.direction == 1) || (this.enemytemp.sprite.y <= this.enemymovingto && this.direction == -1))){
            //this.enemytemp.sprite.y = this.enemymovingto;
            this.enemymoving = false;
            this.movetimer = 0;

            for(let enemy2 of this.enemies){
                if(this.enemytemp.sprite.x <= enemy2.sprite.x+20 && this.enemytemp.sprite.x >= enemy2.sprite.x -20 && this.enemytemp.sprite.y == enemy2.sprite.y && this.enemytemp.sprite.x != enemy2.sprite.x){
                    enemy2.health += this.enemytemp.health;
                    this.enemytemp.sprite.visible = false;
                    this.enemytemp.sprite.destroy(true);
                    let tempnum = enemy2.health/100 - 1;
                    if(tempnum < 0){
                        tempnum = 0;
                    }
                    if(tempnum > 2){
                        tempnum = 2;
                    }
                    tempnum = Math.floor(tempnum);
                    enemy2.sprite.visible = false;
                    enemy2.sprite.destroy(true);
                    let newsprite = this.add.sprite(enemy2.sprite.x,enemy2.sprite.y,"spritesheet",this.vehiclelist[tempnum]);
                    newsprite.setScale(2.5);
                    enemy2.sprite = newsprite;
                    break;
                }
            }
        }
    }
    //("enemymoving");
        this.checkhealth();
        //(Phaser.Physics.Arcade);
        this.checkcollision();
        if(this.currenemy < this.enemyspawns[this.wave]){
        this.enemyspawner++;
        }else if(!this.enemiesonscreen){
            
            //("wave " + this.wave);
            this.wave++;
            this.wavetext.setText("Wave " + (this.wave +1));
            this.currenemy = 0;
            this.enemies = [];
            //("wave " + this.wave);
            for(let i = 0; i < this.enemyspawns[this.wave]; i++){
                this.enemies.push({sprite:{}, health: Math.floor(Math.random() * (this.wave + 1)) * 100 + 100,slowed: false,hit: false});
            }
            //("wave " + this.wave);
            for(let i = 0; i < this.enemies.length; i++){
                let randnum = Math.floor(Math.random() * 4);
                let tempnum = this.enemies[i].health/100 - 1;
                if(tempnum > 2){
                    tempnum = 2;
                }
                
                let newsprite = this.add.sprite(0,this.yslots[randnum],"spritesheet",this.vehiclelist[tempnum]);
                newsprite.visible = false;
                newsprite.setScale(2.5);
                this.enemies[i].sprite = newsprite;
            }
            //("wave " + this.wave);
        }
        
        if(this.enemyspawner >= 40 + this.wave * 10 && this.currenemy < this.enemyspawns[this.wave]){
            this.enemies[this.currenemy].sprite.visible = true;
            this.enemyspawner = 0;
            
            this.currenemy++;
            
        }
        //("enemy spawn");
        this.enemiesonscreen = false;
        for(let enemy of this.enemies){
            if(enemy.sprite.visible == true && enemy.sprite.x <= 1000){
                let diff =  Math.pow(enemy.health/100,-1) * 8
                if(diff > 10){
                    diff = 10;
                }
                if(diff < 0){
                    diff = 5;
                }
                if(enemy.slowed){
                    diff = 1;
                }
                enemy.sprite.x += diff;

                //("yes");

                //(enemy);
            }else if(enemy.sprite.x >= 1000){
                enemy.sprite.x = -100;
                enemy.sprite.y = this.yslots[Math.floor(Math.random() * 4)];
                enemy.hit = false;
            }
            if(enemy.sprite.x < 1000 && enemy.sprite.visible == true){
                this.enemiesonscreen = true;
            }
        }
        //("enemyspeed and loop");
        //("updating");

        for(let i = 0; i < 3; i++){
            if(i == this.current){
                this.bulletdisplay[i].visible = true;
            }
            else{
                this.bulletdisplay[i].visible = false;
            }
        }//
        if(this.timer < 100){
        this.timer++;
        }
        
        //(this.timer);
        let my = this.my;
        //(my.sprite.body.y);
        //(this.movingto)
        
        for (let bullet of this.bullet) {
            if(bullet.sprite.x >= -50){
            bullet.sprite.x -= 10 ;
            bullet.sprite.rotation += -0.4 ;
            }else{
                bullet.sprite.visible = false;
                bullet.sprite.destroy(true);
                this.bullet.splice(this.bullet.indexOf(bullet),1);
            }
        }
        //292
        //("bullet");
        if(this.moving == true){
            for(let prop in my.sprite){
                my.sprite[prop].y += this.direction * 5;
            }
            if(this.direction == 1 && my.sprite.body.y >= this.yslots[this.movingto] || this.direction == -1 && my.sprite.body.y <= this.yslots[this.movingto]){
                this.moving = false;
            }

        }
        //(this.yslots[this.movingto]);
        //("moving");
        if(this.spacekey.isDown && this.timer >= 40  && !this.moving){
            my.sprite.throw.visible = true;
            my.sprite.body.visible = false;
            let newsprite = this.add.sprite(my.sprite.body.x,my.sprite.body.y,"spritesheet", this.bullettypes[this.current]);
            newsprite.setScale(1.5);
            this.bullet.push({sprite:newsprite,type:this.current});
            
            this.timer = 0;
            
        }else if(this.timer >= 10 && this.iframe >= 40){
            my.sprite.body.visible = true;
            my.sprite.throw.visible = false;
        }
        //("shoot");
    }
}
    
}
