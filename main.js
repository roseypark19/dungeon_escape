let gameEngine = new GameEngine();

let ASSET_MANAGER = new AssetManager();

// sprites
ASSET_MANAGER.queueDownload("./sprites/floor.png");
ASSET_MANAGER.queueDownload("./sprites/walls.png");
ASSET_MANAGER.queueDownload("./sprites/cliff.png");
ASSET_MANAGER.queueDownload("./sprites/door.png");
ASSET_MANAGER.queueDownload("./sprites/shadows.png");
ASSET_MANAGER.queueDownload("./sprites/hero.png");

ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	gameEngine.init(ctx);

	new SceneManager(gameEngine);

	gameEngine.start();
});
