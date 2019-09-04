
class Actor {
    constructor() {
        this.visible = true;
        this._x = 0;
        this._y = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.baseSpeed = 0;
        this.maxSpeed = 0;
        this.spin = 0;
        this.angle = 0;
        this.advance = false;
        this._lastUpdate = 0;
        this._destroy = false;
        this._colRadius = 1;
        this.initialize();
    }

    get x() {
        return this._x;
    }

    set x(v) {
        this._x = Math.floor(v);
    }

    get y() {
        return this._y;
    }

    set y(v) {
        this._y = Math.floor(v);
    }

    get radians() {
        return this.angle / Math.PI * 180;
    }

    get time() {
        return (Date.now() - this._lastUpdate) * 0.1;
    }

    initialize() {
    };

    rotate(vx) {
        this.angle += this.spin * vx * this.time;
    }

    acelerate(a) {
        const {time, radians, maxSpeed} = this;
        this.speedX += Math.cos(radians) * a * time;
        this.speedY += Math.sin(radians) * a * time;

        if (this.speedX > maxSpeed) {
            this.speedX = maxSpeed;
        } else if (this.speedX < -maxSpeed) {
            this.speedX = -maxSpeed;
        }

        if (this.speedY > maxSpeed) {
            this.speedY = maxSpeed;
        } else if (this.speedY < -maxSpeed) {
            this.speedY = -maxSpeed;
        }
    }

    update() {
        const {time, radians} = this;

        this.x -= this.speedX;
        this.y -= this.speedY;

        this._lastUpdate = Date.now();
    }

    destroy() {
        this._destroy = true;
    }

    drawCollitionCircle(context) {
        context.strokeStyle = 'red';
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this._colRadius,
            0,
            2 * Math.PI
        );
        context.stroke();
    }

    draw(context) {
        
    }

}

class Bullet extends Actor {

    initialize() {
        this._colRadius = 4;
    }

    setPos(x, y, angle, color = 'red', duration = 300, speed = 20) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = angle;
        const {radians} = this;
        this.speedX = Math.cos(radians) * speed;
        this.speedY = Math.sin(radians) * speed;

        setTimeout(() => {
            this.destroy();
        }, duration);
    }

    draw(context) {
        context.strokeStyle = this.color;
        context.beginPath();
        let va = ((Math.PI * 2) /2);
        let r = this.angle / Math.PI * 180;
        
        for (let i = 0; i < 2; i++) {
            context.lineTo(
                this.x - 10 * Math.cos(va * i + r),
                this.y - 10 * Math.sin(va * i + r)
            );
        }

        context.closePath();
        context.stroke();
    }
}

class Misil extends Actor {

    initialize() {
        this._colRadius = 4;
        setTimeout(() => {
            this.destroy();
        }, 1000);
    }

    setPos(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        const {radians} = this;
        this.speedX = Math.cos(radians) * 4;
        this.speedY = Math.sin(radians) * 4;
    }

    shot() {
        const shots = [];
        for (let i = 0; i < 10; i++) {
            const shot = new Bullet();
            shot.setPos(this.x, this.y, this.angle + i, 'blue', 400, 5);
            shots.push(shot);
        }
        return shots;
    }

    draw(context) {
        context.strokeStyle = 'yellow';
        context.beginPath();
        let va = ((Math.PI * 2) /4);
        let r = this.angle / Math.PI * 180;
        
        for (let i = 0; i < 4; i++) {
            context.lineTo(
                this.x - 10 * Math.cos(va * i + r),
                this.y - 10 * Math.sin(va * i + r)
            );
        }

        context.closePath();
        context.stroke();
    }

}

class Sheep extends Actor {

    initialize() {
        this.spin = 0.001;
        this.direction = 1;
        this.maxSpeed = 10;
        this._colRadius = 5;
        this._lastShot = null;
        this._safe = false;
        this._shotWaitTime = 400;
    }

    safe() {
        this._safe = true;
        this.speedX = 0;
        this.speedY = 0;
        setTimeout(() => {
            this._safe = false;
        }, 2000);
    }

    shot() {
        const now = Date.now();
        if (this._safe || this._lastShot > (now - this._shotWaitTime)) {
            return null;
        }

        const shot = new Bullet();
        shot.setPos(this.x, this.y, this.angle);
        this._lastShot = now;
        return shot;
    }

    misil(onShot) {
        const now = Date.now();
        if (this._safe || this._lastShot > (now - this._shotWaitTime * 10)) {
            return null;
        }

        const shot = new Misil();
        shot.setPos(this.x, this.y, this.angle);
        this._lastShot = now;
        setTimeout(() => {
            onShot(shot.shot());
        }, 1000);
        return shot;
    }

    draw(context) {
        if (this._safe) {
            const p = (Date.now() / 200)|0;
            context.strokeStyle = p % 2 ? '#303030' : '#101010';
        } else {
            context.strokeStyle = 'white';
        }
        context.beginPath();
        let va = ((Math.PI * 2) /3);
        let r = this.angle / Math.PI * 180;
        
        for (let i = 0; i < 3; i++) {
            context.lineTo(
                this.x - 10 * Math.cos(va * i + r),
                this.y - 10 * Math.sin(va * i + r)
            );
        }

        context.closePath();
        context.stroke();
    }
}

class Asteroid extends Actor {

    initialize() {
        this.color = 'green';
        this._colRadius = (Math.random() * 40 + 10) | 0;
    }

    setLimits(w, h) {
        this._limits = [w, h];
        this.x = Math.floor(Math.random() * w);
        this.y = Math.floor(Math.random() * h);
        this.angle = Math.floor(Math.random() * 359) +1;
        const {radians} = this;
        this.speedX = Math.cos(radians) * 2;
        this.speedY = Math.sin(radians) * 2;
    }

    coll(other) {
        const diff = Math.abs(this._colRadius - other._colRadius);
        this.angle += 180; 
        this.x += 10;
        other.x -= 10;
        other.angle = this.angle + 180;
        const {radians} = this;
        this.speedX = Math.cos(radians) * 2;
        this.speedY = Math.sin(radians) * 2;
    }

    crash() {
        if (this._colRadius < 20) {
            this.destroy();
            return;
        }

        this._colRadius = Math.floor(this._colRadius / 2);
        const na = new Asteroid();
        na.setLimits(...this._limits);
        na._colRadius = this._colRadius;
        na.x = this.x;
        na.y = this.y;
        return na;
    }

    draw(context) {
        context.strokeStyle = this.color;
        context.beginPath();
        const va = ((Math.PI * 2) / 6);
        const r = this.angle / Math.PI * 180;

        for (let i = 0; i < 6; i++) {
            context.lineTo(
                this.x - this._colRadius * Math.cos(va * i + r),
                this.y - this._colRadius * Math.sin(va * i + r)
            );
        }

        context.closePath();
        context.stroke();
    }
}

class Game {

    constructor(canvas, swith, sheight) {
        this._canvas = canvas;
        this._with = swith;
        this._height = sheight;
        this._keys = [];
        this._actors = [];
        this._context = null;
        this._lastTick = null;
        this._lifes = 3;
        this._score = 0;
        this._win = false;
        this._over = false;
        this._enemySheep = null;
        this._enemyLauched = false;
        this._nast = 10;
        this.subEvents();
        this.createContext();
        this.render();
    }

    get canvas() {
        return this._canvas;
    }

    get context() {
        return this._context;
    }

    subEvents() {
        document.body.addEventListener('keydown', (ev) => {
            console.log('K', ev.keyCode);
            this._keys[ev.keyCode] = true;
        });

        document.body.addEventListener('keyup', (ev) => {
            this._keys[ev.keyCode] = false;
        });
    }

    createContext() {
        this.canvas.width = this._with;
        this.canvas.height = this._height;
        this._context = this.canvas.getContext('2d');
        this.context.fillStyle = 'black';
        this.context.fillRect(0,0,this._with, this._height);
    }

    addActor(id, actor) {
        this._actors.push({
            id,
            actor,
        });
    }

    launchEnemy() {
        this._enemySheep = new Sheep();
        this._enemySheep.x = 0;
        this._enemySheep.y = 0;
        this._enemySheep.acelerate(0.1);
        this.addActor('enemy', this._enemySheep);
        this._enemyLauched = true;
    }

    update() {
        this._actors = this._actors.filter((x) => !x.actor._destroy);

        const asteroids = this._actors
            .filter((x) => x.actor instanceof Asteroid);

        const bullets = this._actors
            .filter((x) => x.actor instanceof Bullet);

        if (!this._enemyLauched && asteroids.length < 5) {
            //this.launchEnemy();
        }

        if (this._enemySheep) {
            this._enemySheep.acelerate(Math.random());
            this._enemySheep.rotate(((Date.now()/3000)|0) % 2 ? 1 : -1);
            const s = this._enemySheep.shot();
            if (s) {
                this.addActor('enemyshot', s);
            }
        }

        if (!asteroids.length) {
            this._win = true;
            this._nast = Math.floor(this._nast * 1.5);
            this.popualate();
            this._sheep.safe();
            setTimeout(() => {
                this._win = false;
                this._sheep.safe();
            }, 1000);
            return;
        }

        if (this._keys[87]) {
            this._sheep.acelerate(0.1);
        }

        if (this._keys[68]) {
            this._sheep.rotate(1);
        }

        if (this._keys[65]) {
            this._sheep.rotate(-1);
        }   

        if (this._keys[32]) {
            let shot = this._sheep.shot();
            if (shot) {
                this.addActor('ray', shot);
            }
        }

        if (this._keys[77]) {
            let shot = this._sheep.misil((i) => {
                i.map((a) => this.addActor('mbullet',a));
            });
            if (shot) {
                this.addActor('ray', shot);
            }
        }

        for (let a of this._actors) {
            a.actor.update();
            if (a.actor.x < 0) {
                a.actor.x = this._with;
            } else if (a.actor.x > this._with) {
                a.actor.x = 0;
            }

            if (a.actor.y < 0) {
                a.actor.y = this._height;
            } else if (a.actor.y > this._height) {
                a.actor.y = 0;
            }
        }


        if (this._over) {
            return;
        }

        for (let a of asteroids) {

            /*for (let o of asteroids) {
                if (o.actor === a.actor) {
                    continue;
                }
                if (Game.circleCollition(a.actor, o.actor)) {
                    a.actor.coll(o.actor);
                }
            }*/

            for (let b of bullets) {
                if (Game.circleCollition(a.actor, b.actor)) {
                    this._score += (100 - a.actor._colRadius);
                    const na = a.actor.crash();
                    b.actor.destroy();
                    if (na) {
                        this.addActor('asteroid', na);
                    }
                    break;
                }
            }

            if (this._sheep._safe) {
                continue;
            }

            if (Game.circleCollition(this._sheep, a.actor)) {
                this._lifes--;
                this._score -= 200;
                if (this._lifes < 0) {
                    this._lifes = 0;
                }
                this._sheep.x = this._with / 2;
                this._sheep.y = this._height / 2;
                this._sheep.safe();
                break;
            }

            if (!this._lifes) {
                this._over;
                this._sheep.destroy();
            }
        }

    }

    drawLifes(context) {
        let startX = this._with - 100;
        let startY = 10;
        let points = [[9,9], [-9,9]];
        context.strokeStyle = 'yellow';
        for (let i = 0; i < this._lifes; i++) {
            context.beginPath();
            context.moveTo(startX, startY);
            for (let x = 0; x < points.length; x++) {
                context.lineTo(
                    startX + points[x][0],
                    startY + points[x][1]
                );
            }
            context.closePath();
            context.stroke();
            startX -= 30;
        }

    }

    drawScore(context) {
        context.fillStyle = 'yellow';
        context.font = '21px Mono';
        context.fillText(`Score: ${this._score}`, 20, 35);
        
    }

    render() {
        this.context.clearRect(0,0,this._with, this._height);

        for (let a of this._actors) {
            a.actor.draw(this.context);
            // a.actor.drawCollitionCircle(this.context);
        }

        if (this._win) {
            this.context.fillStyle = 'white';
            this.context.font = '50px Mono';
            this.context.fillText(
                `WINNER\n${this._score}`,
                this._with / 2 - 150,
                this._height / 2
            );
        } else if (this._lifes) {
            this.drawScore(this.context);
            this.drawLifes(this.context);
        } else {
            this.context.fillStyle = 'orange';
            this.context.font = '50px Mono';
            this.context.fillText(
                `GAME OVER\n${this._score}`,
                this._with / 2 - 150,
                this._height / 2
            );
        }
    }

    popualate() {
        for (let i = 0; i < this._nast ; i++) {
            const asteroid = new Asteroid();
            asteroid.setLimits(this._with, this._height);
            this.addActor(`asteroid${i}`, asteroid);
        }
    }

    start() {
        const sheep = new Sheep();
        sheep.x = this._with / 2;
        sheep.y = this._height / 2;
        sheep.safe();
        this._sheep = sheep;
        this.popualate();
        this.addActor('sheep', sheep);
        this.tick();
    }

    tick() {
        this.update();
        this.render();
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    static circleCollition(actorA, actorB) {
        if (actorA._destroy || actorB._destroy) {
            return false;
        }

        const rs = actorA._colRadius + actorB._colRadius;
        const xDiff = actorA.x - actorB.x;
        const yDiff = actorA.y - actorB.y;
        return rs > Math.sqrt(Math.abs((xDiff * xDiff) + (yDiff * yDiff)));
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('screen');
    const game = new Game(canvas, 1024, 500);
    game.start();
});
