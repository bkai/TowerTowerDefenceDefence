// import { Enemy } from "./enemy";
// import { GridPosition } from "./terrain";

import { TOWER_HEALTH_REGEN } from "./config";
import { HealthBar } from "./healthBar";
import { TDScene } from "./scenes/tdScene";
import { Terrain, TileType, TILE_SIZE } from "./terrain";

// export abstract class Tower {
//     pos: GridPosition

//     abstract step(enemies: Array<Enemy>): void;
// }

// export class BasicTower extends Tower {
//     step(enemies: Array<Enemy>) {
//         // shoot enemies if applicable
//     }
// }

// todo: move to scene?
function getEnemy(x, y, range, enemies) {
    for (let enemyGroup in enemies) {
        let enemyUnits = enemies[enemyGroup].getChildren();
        for (let i = 0; i < enemyUnits.length; i++) {
            if (enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= range)
                return enemyUnits[i];

        }
    }
    return false;
}


export class Tower extends Phaser.GameObjects.Container {
    scene: TDScene

    towerTurret: TowerTurret
    towerMid: Phaser.GameObjects.Sprite
    towerBase: Phaser.GameObjects.Sprite
    healthBar: HealthBar

    public innerTowerScene: TDScene

    constructor(towerScene: TDScene) {
        super(towerScene, 0, 0)
        this.towerTurret = new TowerTurret(towerScene)
        this.healthBar = new HealthBar(towerScene)
        this.scene = towerScene;
    }

    public make(i: number, j: number, innerTowerScene: TDScene) {
        this.towerTurret.setActive(true);
        this.towerTurret.setVisible(true);

        let xCoord = i * TILE_SIZE + TILE_SIZE / 2
        let yCoord = j * TILE_SIZE + TILE_SIZE / 2

        this.towerBase = this.scene.add.sprite(xCoord, yCoord, 'towerbase')
        this.add(this.towerBase);
        this.towerMid = this.scene.add.sprite(xCoord, yCoord, 'towermid')
        this.add(this.towerMid);

        this.towerTurret.place(i, j, this.scene.terrain);
        this.scene.terrain.placeTower(i, j, this);

        this.add(this.towerTurret);

        this.healthBar.make(xCoord, yCoord + TILE_SIZE / 2 - 8, TILE_SIZE - 14)
        this.add(this.healthBar)

        this.innerTowerScene = innerTowerScene
        this.innerTowerScene.onEnemyReachedEnd(() => {
            this.healthBar.health -= 0.2 // todo systematically
        })
    }

    update(time, delta) {
        this.towerTurret.update(time, delta)
        
        this.healthBar.health += TOWER_HEALTH_REGEN * delta
        this.healthBar.update(time, delta)
    }
}


export class TowerTurret extends Phaser.GameObjects.Image {
    nextTic: number
    x: number
    y: number

    scene: TDScene

    constructor(scene) {
        super(scene, 0, 0, 'towertop0');
        this.nextTic = 0;
    }

    // we will place the tower according to the grid
    place(i: integer, j: integer, terrain: Terrain) {
        [this.x, this.y] = terrain.fromGridPos(i, j)
    }

    fire() {
        var enemy = getEnemy(this.x, this.y, 200, this.scene.allEnemies);
        if (enemy) {
            var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
            this.scene.addBullet(this.x, this.y, angle);
            this.angle = (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
            return true;
        }
        return false
    }

    update(time, delta) {
        if (time > this.nextTic) {
            if (this.fire())
                this.nextTic = time + 1000;
            else
                this.nextTic = time + 50;
        }
    }
}
