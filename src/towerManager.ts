import { TDScene } from "./scenes/tdScene";
import { TILE_SIZE } from "./terrain"
import { NewTower } from "./towers";

export class TowerManager {
    scene: TDScene

    constructor(scene: TDScene) {
        this.scene = scene;
    }

    public placeTower(pointer) {
        var i = Math.floor((pointer.x + this.scene.cameras.main.scrollX) / TILE_SIZE);
        var j = Math.floor((pointer.y + this.scene.cameras.main.scrollY) / TILE_SIZE);

        if (this.scene.terrain.canPlaceTower(i, j)) {
            // only switch to new scene when tower can be build
            let newScene = this.scene.metaScene.addScene(this.scene)
            this.scene.metaScene.switchToScene(newScene.sceneNumber)

            var tower: NewTower = this.scene.towers.get();
            if (tower) {
                tower.make(i, j, newScene);
            }
        }

        let potentialExistingTower = this.scene.terrain.tryGetExistingTower(i, j);
        if (potentialExistingTower){
            this.scene.metaScene.switchToScene(potentialExistingTower.innerTowerScene.sceneNumber)
        }
        
    }
}