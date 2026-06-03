const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.8;

const playerImg = new Image();
playerImg.src = "assets/player.png";

const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";

const bossImg = new Image();
bossImg.src = "assets/boss.png";

const ground = canvas.height - 120;

const player = {
    x:100,
    y:200,
    width:90,
    height:90,
    speed:6,
    velY:0,
    jumping:false,
    hp:100,
    maxHp:100,
    invincible:false
};

const fibonacci = [1,1,2,3,5,8,13,21];

let currentSequence = [];
let fibIndex = 0;

let score = 0;

const tower = {
    x:canvas.width - 300,
    y:ground - 350,
    width:180,
    height:350
};

const boss = {
    x:tower.x + 20,
    y:tower.y - 120,
    width:140,
    height:140,
    hp:500,
    maxHp:500
};

const enemies = [
    {
        x:500,
        y:ground-80,
        width:50,
        height:50,
        speed:2
    },
    {
        x:900,
        y:ground-80,
        width:50,
        height:50,
        speed:-2
    },
    {
        x:1300,
        y:ground-80,
        width:80,
        height:80,
        speed:3
    }
];

const blocks = [];

const keys = {};

window.addEventListener("keydown", e=>{
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e=>{
    keys[e.key.toLowerCase()] = false;
});

function spawnBlock(){

    // BLOCO DE CURA RARO
    const healBlock = Math.random() < 0.07;

    if(healBlock){

        blocks.push({
            x:Math.random() * (canvas.width - 100),
            y:-50,
            width:60,
            height:60,
            speed:3,
            heal:true,
            amount:25
        });

        return;
    }

    // BLOCO NORMAL
    const correct = Math.random() > 0.35;

    let number;

    if(correct){
        number = fibonacci[fibIndex];
    }else{
        number = Math.floor(Math.random()*20)+1;
    }

    blocks.push({
        x:Math.random() * (canvas.width - 100),
        y:-50,
        width:60,
        height:60,
        speed:3,
        number:number,
        correct:correct,
        heal:false
    });
}

setInterval(spawnBlock,1000);

function damagePlayer(amount){

    if(player.invincible) return;

    player.hp -= amount;

    if(player.hp < 0){
        player.hp = 0;
    }

    player.invincible = true;

    setTimeout(()=>{
        player.invincible = false;
    },1500);

    if(player.hp <= 0){
        alert("GAME OVER");
        location.reload();
    }
}

function updatePlayer(){

    if(keys["a"]){
        player.x -= player.speed;
    }

    if(keys["d"]){
        player.x += player.speed;
    }

    if(keys["w"] && !player.jumping){
        player.velY = -16;
        player.jumping = true;
    }

    player.velY += gravity;
    player.y += player.velY;

    if(player.y + player.height >= ground){
        player.y = ground - player.height;
        player.velY = 0;
        player.jumping = false;
    }

    if(player.x < 0){
        player.x = 0;
    }

    if(player.x + player.width > canvas.width){
        player.x = canvas.width - player.width;
    }
}

function updateEnemies(){

    for(const enemy of enemies){

        enemy.x += enemy.speed;

        if(enemy.x < 100 || enemy.x > canvas.width - 250){
            enemy.speed *= -1;
        }

        if(collide(player, enemy)){
            damagePlayer(10);
        }
    }

    if(collide(player, boss)){
        damagePlayer(10);
    }
}

function updateBlocks(){

    for(let i=blocks.length-1; i>=0; i--){

        const b = blocks[i];

        b.y += b.speed;

        if(collide(player,b)){

            // BLOCO DE CURA
            if(b.heal){

                player.hp += b.amount;

                if(player.hp > player.maxHp){
                    player.hp = player.maxHp;
                }

                score += 15;

                blocks.splice(i,1);

                continue;
            }

            // BLOCO FIBONACCI
            if(b.number === fibonacci[fibIndex]){

                currentSequence.push(b.number);

                score += 10;

                fibIndex++;

                if(fibIndex >= fibonacci.length){

                    fibIndex = 0;

                    boss.hp -= boss.maxHp * 0.15;

                    if(boss.hp < 0){
                        boss.hp = 0;
                    }

                    currentSequence = [];

                    score += 100;

                    if(boss.hp <= 0){

    boss.hp = 0;

    // tela escura
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // mensagem vitória
    ctx.fillStyle = "#00ff88";
    ctx.font = "60px Arial";
    ctx.fillText(
        "VOCÊ VENCEU!",
        canvas.width/2 - 220,
        canvas.height/2
    );

    ctx.font = "30px Arial";

    ctx.fillStyle = "white";

    ctx.fillText(
        "O Guardião Fibonacci foi derrotado",
        canvas.width/2 - 260,
        canvas.height/2 + 60
    );

    // para o jogo
    cancelAnimationFrame(animationId);

    return;
}
                }

            }else{

                score -= 5;

                currentSequence = [];

                fibIndex = 0;
            }

            blocks.splice(i,1);
        }

        if(b.y > canvas.height){
            blocks.splice(i,1);
        }
    }
}

function collide(a,b){

    return(
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function drawSky(){

    const gradient = ctx.createLinearGradient(0,0,0,canvas.height);

    gradient.addColorStop(0,"#13293d");
    gradient.addColorStop(1,"#1d6fa5");

    ctx.fillStyle = gradient;

    ctx.fillRect(0,0,canvas.width,canvas.height);
}

function drawGround(){

    ctx.fillStyle = "#2d6a4f";

    ctx.fillRect(0,ground,canvas.width,200);

    for(let i=0; i<canvas.width; i+=80){

        ctx.fillStyle = "#588157";

        ctx.fillRect(i,ground-20,80,20);
    }
}

function drawTower(){

    ctx.fillStyle = "#555";

    ctx.fillRect(
        tower.x,
        tower.y,
        tower.width,
        tower.height
    );

    for(let y=tower.y; y<tower.y+tower.height; y+=30){

        for(let x=tower.x; x<tower.x+tower.width; x+=30){

            ctx.strokeStyle = "#777";

            ctx.strokeRect(x,y,30,30);
        }
    }
}

function drawPlayer(){

    if(player.invincible){
        ctx.globalAlpha = 0.5;
    }

    ctx.drawImage(
        playerImg,
        player.x,
        player.y,
        player.width,
        player.height
    );

    ctx.globalAlpha = 1;
}

function drawEnemies(){

    for(const enemy of enemies){

        ctx.drawImage(
            enemyImg,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
    }
}

function drawBoss(){

    ctx.drawImage(
        bossImg,
        boss.x,
        boss.y,
        boss.width,
        boss.height
    );
}

function drawBlocks(){

    for(const b of blocks){

        // BLOCO DE CURA
        if(b.heal){

            ctx.fillStyle = "#00ff88";

            ctx.fillRect(
                b.x,
                b.y,
                b.width,
                b.height
            );

            ctx.fillStyle = "white";

            ctx.font = "32px Arial";

            ctx.fillText(
                "+",
                b.x + 18,
                b.y + 40
            );

            continue;
        }

        // BLOCO NORMAL
        ctx.fillStyle = b.correct ? "#ffd166" : "#ef476f";

        ctx.fillRect(
            b.x,
            b.y,
            b.width,
            b.height
        );

        ctx.fillStyle = "#000";

        ctx.font = "26px Arial";

        ctx.fillText(
            b.number,
            b.x + 18,
            b.y + 38
        );
    }
}

function drawHUD(){

    ctx.fillStyle = "rgba(0,0,0,.6)";

    ctx.fillRect(20,20,430,180);

    ctx.fillStyle = "white";

    ctx.font = "28px Arial";

    ctx.fillText("FIBBO QUEST", 35, 55);

    ctx.font = "22px Arial";

    ctx.fillText("Pontos: " + score, 35, 95);

    ctx.fillText(
        "Sequência: " + currentSequence.join(", "),
        35,
        130
    );

    ctx.fillText(
        "Próximo: " + fibonacci[fibIndex],
        35,
        165
    );

    // HP PLAYER
    ctx.fillStyle = "#333";

    ctx.fillRect(20, canvas.height - 80, 300, 30);

    ctx.fillStyle = "#00ff88";

    ctx.fillRect(
        20,
        canvas.height - 80,
        (player.hp/player.maxHp)*300,
        30
    );

    ctx.fillStyle = "white";

    ctx.font = "20px Arial";

    ctx.fillText(
        "HP PLAYER: " + player.hp + "/" + player.maxHp,
        30,
        canvas.height - 58
    );

    // HP BOSS
    ctx.fillStyle = "#333";

    ctx.fillRect(canvas.width - 370, 30, 320, 30);

    ctx.fillStyle = "red";

    ctx.fillRect(
        canvas.width - 370,
        30,
        (boss.hp/boss.maxHp)*320,
        30
    );

    ctx.fillStyle = "white";

    ctx.fillText(
        "BOSS: " + Math.floor(boss.hp) + "/" + boss.maxHp,
        canvas.width - 360,
        53
    );
}

function render(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawSky();
    drawGround();
    drawTower();
    drawBlocks();
    drawEnemies();
    drawBoss();
    drawPlayer();
    drawHUD();
}

function update(){

    updatePlayer();

    updateEnemies();

    updateBlocks();
}

function loop(){

    update();

    render();

    requestAnimationFrame(loop);
}

loop();