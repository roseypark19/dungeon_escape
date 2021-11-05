class Hero {
    constructor(game, x, y, spritesheet) {
        Object.assign(this, { game, x, y, spritesheet });
        this.facing = [0, 0]; // down, up, right, left
                              // 0, 1, 0, 1 
        this.state = 0; // idle, walking, shooting, charged, dead
                        // 0, 1, 2, 3, 4
        this.chargeTimer = 0;
        this.chargeTime = 1.26;
        this.velocityConstant = 4;
        this.velocity = { x : 0, y : 0 };
        this.animations = [];
        this.updateBB();
        this.loadAnimations();
    };

    loadAnimations() {
        for (let i = 0; i < 5; i++) { // 6 states
            this.animations.push([]);
            for (let j = 0; j < 2; j++) { // 2 vertical facings
                this.animations[i].push([]);
                for (let k = 0; k < 2; k++) { // 2 horizontal facings
                    this.animations[i][j].push([]);
                }
            }  
        }

        // idle animations
        this.animations[0][0][0] = new Animator(this.spritesheet, 0, 0, 32, 32, 16, 0.25, false, true);
        this.animations[0][0][1] = new Animator(this.spritesheet, 16 * 32, 0, 32, 32, 16, 0.25, false, true);
        this.animations[0][1][0] = new Animator(this.spritesheet, 32 * 32, 0, 32, 32, 16, 0.25, false, true);
        this.animations[0][1][1] = new Animator(this.spritesheet, 48 * 32, 0, 32, 32, 16, 0.25, false, true);

        // walking animations
        this.animations[1][0][0] = new Animator(this.spritesheet, 64 * 32, 0, 32, 32, 4, 0.1, false, true);
        this.animations[1][0][1] = new Animator(this.spritesheet, 68 * 32, 0, 32, 32, 4, 0.1, false, true);
        this.animations[1][1][0] = new Animator(this.spritesheet, 72 * 32, 0, 32, 32, 4, 0.1, false, true);
        this.animations[1][1][1] = new Animator(this.spritesheet, 76 * 32, 0, 32, 32, 4, 0.1, false, true);

        // shooting animations
        this.animations[2][0][0] = new Animator(this.spritesheet, 80 * 32, 0, 32, 32, 4, 0.06, false, true);
        this.animations[2][0][1] = new Animator(this.spritesheet, 84 * 32, 0, 32, 32, 4, 0.06, false, true);
        this.animations[2][1][0] = new Animator(this.spritesheet, 88 * 32, 0, 32, 32, 4, 0.06, false, true);
        this.animations[2][1][1] = new Animator(this.spritesheet, 92 * 32, 0, 32, 32, 4, 0.06, false, true);

        // charging animations
        this.animations[3][0][0] = new Animator(this.spritesheet, 96 * 32, 0, 32, 32, 18, 0.07, false, true);
    };
    
    update() {

        let newVelX = 0;
        let newVelY = 0;
        this.facing[0] = 0;
        
        if (this.game.right) {
            newVelX += this.velocityConstant;
            this.facing[1] = 0;
        }
        if (this.game.left) {
            newVelX -= this.velocityConstant;
            this.facing[1] = 1;
        }
        if (this.game.up) {
            newVelY -= this.velocityConstant;
            this.facing[0] = 1;
        }
        if (this.game.down) {
            newVelY += this.velocityConstant;
            this.facing[0] = 0;
        }

        if (newVelX !== 0 && newVelY !== 0) var diagonalVel = Math.sqrt(Math.pow(this.velocityConstant, 2) / 2);

        if (diagonalVel) {
            newVelX = newVelX > 0 ? diagonalVel : -diagonalVel;
            newVelY = newVelY > 0 ? diagonalVel : -diagonalVel;
        } 

        if (this.chargeTimer === 0) {
            this.state = this.velocity.x === 0 && this.velocity.y === 0 ? 0 : 1; // update movement state if not charging
        } 
        if (this.game.clicked && this.chargeTimer === 0) {
            let mousePoint = this.game.mouse ? this.game.mouse : this.game.click;
            this.facing[0] = mousePoint.y < this.BB.center.y - this.game.camera.y ? 1 : 0;
            this.facing[1] = mousePoint.x < this.BB.center.x - this.game.camera.x ? 1 : 0; 
            this.state = 2;
        }
        if (this.state === 2 && this.game.charge && this.chargeTimer === 0) { // charge
            this.state = 3;
        }
        if (this.state === 3) { // charging
            this.chargeTimer += this.game.clockTick;
            this.facing = [0, 0]; // face right forward
            if (this.chargeTimer > this.chargeTime) this.chargeTimer = 0;  
        }
        if (this.state !== 3) { // only move if not charging
            this.velocity.x = newVelX;
            this.velocity.y = newVelY;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }

        // collision detection and resolve
        this.originalCollisionBB = this.collisionBB;
        this.updateBB();
        let collisionList = [];

        let that = this;
        this.game.entities.forEach(function(entity) {
            if (entity.collideable && that.collisionBB.collide(entity.BB)) { 
                collisionList.push(entity);
            }
        });

        if (collisionList.length > 0) {
            collisionList.sort((boundary1, boundary2) => distance(this.collisionBB.center, boundary1.BB.center) -
                                                         distance(this.collisionBB.center, boundary2.BB.center));
            for (let i = 0; i < collisionList.length; i++) {
                if (this.collisionBB.collide(collisionList[i].BB)) {
                    Collision.resolveCollision(this, collisionList[i]);
                    this.updateBB();
                }
            }
        }
    };

    updateBB() {
        this.BB = new BoundingBox(this.x, this.y, 32 * PARAMS.SCALE, 32 * PARAMS.SCALE);
        this.hitBB = new BoundingBox(this.x + 12 * PARAMS.SCALE, this.y + 12 * PARAMS.SCALE, 8 * PARAMS.SCALE, 8 * PARAMS.SCALE);
        this.collisionBB = new BoundingBox(this.hitBB.x + 2 * PARAMS.SCALE, this.hitBB.y + 4 * PARAMS.SCALE, 4 * PARAMS.SCALE, 4 * PARAMS.SCALE);
    };
    
    draw(ctx) {
        this.animations[this.state][this.facing[0]][this.facing[1]]
            .drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, PARAMS.SCALE);

        if (PARAMS.DEBUG) {
            ctx.lineWidth = PARAMS.DEBUG_WIDTH;
            ctx.strokeStyle = PARAMS.DEBUG_COLOR;
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
            ctx.strokeRect(this.hitBB.x - this.game.camera.x, this.hitBB.y - this.game.camera.y, this.hitBB.width, this.hitBB.height);
            ctx.strokeRect(this.collisionBB.x - this.game.camera.x, this.collisionBB.y - this.game.camera.y, this.collisionBB.width, this.collisionBB.height);
        }
    };
};

