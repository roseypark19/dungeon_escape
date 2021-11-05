class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;
        this.x = 0;
        this.y = 0;
        this.hero = {x: 200, y:200};
        this.loadLevel();
    };

    loadLevel() {
        
        this.loadLayer(level.cliffs);
        this.loadLayer(level.floor);
        this.loadLayer(level.shadows);
        this.loadLayer(level.wall_base);
        this.loadLayer(level.doors);
        this.hero = new Hero(this.game, 200, 200, ASSET_MANAGER.getAsset("./sprites/hero.png"));
        this.game.addEntity(this.hero);
        this.loadLayer(level.wall_toppers);
    };

    update() {
        PARAMS.DEBUG = document.getElementById("debug").checked;
        let midpoint = { x : PARAMS.CANVAS_WIDTH / 2 - PARAMS.BLOCKWIDTH / 2, y : PARAMS.CANVAS_HEIGHT / 2 - PARAMS.BLOCKWIDTH / 2 };
        this.x = this.hero.x - midpoint.x;
        this.y = this.hero.y - midpoint.y;
    };

    draw(ctx) {};

    loadLayer(property) {
        for (let i = 0; i < level.height; i++) {
            for  (let j = 0; j < level.width; j++) {
                let cell = level.width * i + j;
                let spriteCode = property.data[cell];
                if (spriteCode != -1) {
                    this.game.addEntity(new MapTile(this.game, 
                                                    j * PARAMS.BLOCKWIDTH * PARAMS.SCALE,
                                                    i * PARAMS.BLOCKWIDTH * PARAMS.SCALE,
                                                    property.spritesheet,
                                                    PARAMS.BLOCKWIDTH * (spriteCode % property.imageWidth),
                                                    PARAMS.BLOCKWIDTH * (Math.floor(spriteCode / property.imageWidth)),
                                                    property.collideable));
                }
            }
        }
    };


}