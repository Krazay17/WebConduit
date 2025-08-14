import io from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import GhostPlayer from './GhostPlayer.js';
import GameManager from './GameManager.js';
import PlayerUI from '../scenes/playerUI.js';
import VoiceChatManager from './VoiceChatManager.js';

export default class NetworkManager extends Phaser.Events.EventEmitter {
  static instance;

  constructor(scene) {
    super();
    if (NetworkManager.instance) return NetworkManager.instance;
    NetworkManager.instance = this;

    this.scene = scene;
    this.otherPlayers = {};
    this.otherEnemies = {};

    const serverURL =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'wss://webconduit.onrender.com';


    //this.scene.events.on('shutdown', () => this.voiceChat.destroy());

    this.socket = io(serverURL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const normalizeId = (id) => String(id).replace(/^['"]+|['"]+$/g, '').trim();

    this.voiceChat = new VoiceChatManager(
      this.socket,
      () => null,
      (id) => this.otherPlayers[normalizeId(id)]
    );

    if (this.voiceChat) {
      setInterval(() => {
        this.voiceChat.updateVolumes();
      }, 200);
    };

    // On connection
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);

      this.socket.emit('pingCheck');

      setInterval(() => {
        this.socket.emit('pingCheck');
      }, 5000);

      // Initial sync request after gathering local player data
      const data = GameManager.getNetworkData();

      this.socket.emit('playerSyncRequest', { data });
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Disconnected from server:', reason);
      // You could show a "Reconnecting..." message here if needed

      // Destroy all ghost players
      for (const id in this.otherPlayers) {
        this.otherPlayers[id].destroy();
        delete this.otherPlayers[id];
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'tries');

      // Re-send player data to re-register this client
      const data = GameManager.getNetworkData();
      const location = GameManager.getLastLocation();
      this.socket.emit('playerSyncRequest', { x: location.x, y: location.y, data });
    });


    // Add already-connected players
    this.socket.on('existingPlayers', (players) => {
      console.log('Existing players received:', players);
      players.forEach(({ id, data }) => {
        if (id !== this.socket.id) {
          //this.savedOtherPlayers = players;
          this.addOtherPlayer(id, data);
        }
      });
    });

    // New player joined
    this.socket.on('playerJoined', ({ id, data }) => {
      if (!this.otherPlayers[id] && id !== this.socket.id) {
        this.addOtherPlayer(id, data);
      }
    });
    // Player left
    this.socket.on('playerLeft', ({ id }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.destroy();
        delete this.otherPlayers[id];
      }
    });

    this.socket.on('droppedDueToInactivity', () => {
      console.warn('You were dropped due to inactivity. Resyncing...');

      // Resend current state
      // const data = GameManager.getNetworkData();
      // this.socket.emit('playerSyncRequest', { x: 0, y: 0, data });
    });

    // General sync update
    this.socket.on('playerSyncUpdate', ({ id, data }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.syncAll(data);
      }
    });


    // Name update
    this.socket.on('playerNamed', ({ id, text, color }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.updateName(text, color);
      }
    });

    this.socket.on('playerStateUpdate', ({ id, state }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.state = state;
        player.x = state.x;
        player.y = state.y;
        player.setGhostState(state);
      }
    })

    this.socket.on('playerLeveled', ({ id, money, auraLevel }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.updatePower(money, auraLevel);
      }
    });

    this.socket.on('shurikanthrown', ({ id, shotInfo }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.ghostShurikan(shotInfo);
      }
    });

    this.socket.on('playerchatUpdate', ({ id, message }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.makeChatBubble(message);
      }
    });

    this.socket.on('updateHealthUpdate', ({ id, health, max }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.updateHealth(health, max);
        player.health = health;
        player.healthMax = max;
        this.emit('healthChanged');

      }
    });

    this.socket.on('highScoreUpdate', (data) => {
      this.scene.updateScoreBoard(data);
    });

    this.socket.on('enemyStateUpdate', (data) => {
      const { x, y, type, id, vx, vy, sceneKey } = data;

      if (this.scene.scene.key !== sceneKey) return;

      let enemy = this.otherEnemies[id];

      if (!enemy) {
        enemy = this.spawnEnemy(data);
        this.otherEnemies[id] = enemy;
        return;
      }
      enemy.setPosition(x, y);
      if (enemy.body) {
        enemy.body.velocity.x = vx;
        enemy.body.velocity.y = vy;
      }
    });

    this.socket.on('pvpDamageUpdate', ({id, data}) => {
        const {x, y, damage, stunDuration} = data;
        this.scene.player.TakeDamage(x, y, damage, stunDuration, id);
    });

    this.socket.on('pvpKillUpdate', ({id, data}) => {
      const {killer, money} = data;
      this.scene.player.updateMoney(money);
    })
    
    this.socket.on('enemyDamageUpdate', (info) => {
      const { id, player, damage, stagger, duration } = info;
      if (this.otherEnemies[id]) {
        this.otherEnemies[id].applyDamage?.(this.scene.player, damage, stagger, duration);
      }
    });

    this.socket.on('spawnCardUpdate', ({ id, cardData }) => {
      const player = this.otherPlayers[id];
      this.scene.spawnManager.spawnCard(cardData);
    });

  }

  addOtherPlayer(id, data) {
    if (this.otherPlayers[id]) {
      this.otherPlayers[id].destroy();
    }

    const ghost = new GhostPlayer(this.scene, id, data);
    this.otherPlayers[id] = ghost;
  }

  refreshScene(scene) {
    this.scene = scene;

    for (const id in this.otherPlayers) {
      const oldGhost = this.otherPlayers[id];
      const { data } = oldGhost.getSyncData();

      oldGhost.destroy();

      this.otherPlayers[id] = new GhostPlayer(scene, id, data);
    }
  }

  spawnEnemy(info) {
    const { x, y, type, health, id, sceneKey } = info;
    if (!this.scene || !this.scene.spawnManager || (this.scene.scene.key != sceneKey)) return;
    let enemy;

    switch (type) {
      case 'duck':
        //enemy = this.scene.spawnManager.spawnDuck(x, y, health, true);
        break;
      case 'bat':
        enemy = this.scene.spawnManager.spawnBat(x, y, health, true, id);
        break;
      case 'sunMan':
        enemy = this.scene.spawnManager.spawnSunMan(x, y, health, true, id);
        break;
      default:
        console.warn('Unknown Enemy Type: ', type);
    }
    return enemy;
  }

}
