import GameManager from "./GameManager";

export default class VoiceChatManager {
  constructor(socket, getPlayerPosition, getRemotePlayerById) {
    this.socket = socket;
    this.getPlayerPosition = getPlayerPosition;
    this.getRemotePlayerById = getRemotePlayerById;

    this.peerConnections = {};
    this.remoteAudioElements = {};
    this.localStream = null;
    this.modifiedStream = null;

    this.maxDistance = 800;

    this._initMic().then(() => this._setupSocketHandlers());
  }

  async _initMic() {
    try {
      this.audioContext = new AudioContext();
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const source = this.audioContext.createMediaStreamSource(this.localStream);

      this.gainNode = this.audioContext.createGain();
      this.compressor = this.audioContext.createDynamicsCompressor();
      const dest = this.audioContext.createMediaStreamDestination();

      source
        .connect(this.gainNode)
        .connect(this.compressor)
        .connect(dest);

      this.modifiedStream = dest.stream;

      // 🔔 Let others know we're ready to talk
      this.socket.emit('join-voice');
    } catch (e) {
      console.error('❌ Failed to access mic:', e);
    }
  }

  _setupSocketHandlers() {
    this.socket.on('user-joined', async (id) => {
      if (!this.modifiedStream) {
        console.warn(`Mic not ready yet for user-joined: ${id}`);
        return;
      }

      const pc = this._createPeerConnection(id);
      this.peerConnections[id] = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.socket.emit('signal', { to: id, data: { sdp: pc.localDescription } });
    });

    this.socket.on('signal', async ({ from, data }) => {
      let pc = this.peerConnections[from];
      if (!pc) {
        pc = this._createPeerConnection(from);
        this.peerConnections[from] = pc;
      }

      if (data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          this.socket.emit('signal', { to: from, data: { sdp: pc.localDescription } });
        }
      } else if (data.candidate) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    this.socket.on('playerLeft', (id) => {
      this._removePeer(id);
    });

  }

  _createPeerConnection(id) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });


    if (this.modifiedStream) {
      this.modifiedStream.getTracks().forEach(track => {
        pc.addTrack(track, this.modifiedStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('signal', { to: id, data: { candidate: event.candidate } });
      }
    };

pc.ontrack = (event) => {
  const [stream] = event.streams;

  // 🎤 Create media source from the remote stream
  const source = this.audioContext.createMediaStreamSource(stream);

  // 🔊 Gain node for per-player volume
  const gain = this.audioContext.createGain();

  // 🧠 Panner node for spatial audio
  const panner = this.audioContext.createPanner();
  panner.panningModel = 'HRTF'; // more realistic sound falloff
  panner.distanceModel = 'linear';
  panner.maxDistance = this.maxDistance || 800;
  panner.rolloffFactor = 1; // how quickly volume drops with distance
  panner.refDistance = 1;

  // 🎚️ Connect the audio chain: source → panner → gain → destination
  source.connect(panner);
  panner.connect(gain);
  gain.connect(this.audioContext.destination);

  // 📦 Save for updates later
  this.remoteAudioElements[id] = { source, panner, gain };
};


    return pc;
  }

  setMicVolume(value) {
    if (this.gainNode) {
      this.gainNode.gain.value = Phaser.Math.Clamp(value, 0, 1);
    }
  }

  setPan(valueX, valueY) {
    if (this.panNode) {
      this.panNode.positionX.value = Phaser.Math.Clamp(valueX, -1, 1);
      this.panNode.positionY.value = Phaser.Math.Clamp(valueY, -1, 1);
    }
  }

  setCompression({ threshold = -50, ratio = 12 } = {}) {
    if (this.compressor) {
      this.compressor.threshold.value = threshold;
      this.compressor.ratio.value = ratio;
    }
  }

updateVolumes() {
  const selfPos = this.getPlayerPosition();
  if (!selfPos) return;

  for (const [id, audioNodes] of Object.entries(this.remoteAudioElements)) {
    const remote = this.getRemotePlayerById(id);
    if (!remote) continue;

    const { x: sx, y: sy } = selfPos;
    const { x: rx, y: ry } = remote;

    const dist = Phaser.Math.Distance.Between(sx, sy, rx, ry);

    // Update gain (volume falloff)
    const volume = dist > this.maxDistance
      ? 0
      : (1 - dist / this.maxDistance) * GameManager.volume.voice;

    audioNodes.gain.gain.value = Phaser.Math.Clamp(volume, 0, 1);

    // Update panner 3D position
    audioNodes.panner.setPosition(rx, ry, 0); // 2D game, so z = 0
  }
}


  _removePeer(id) {
    if (this.peerConnections[id]) {
      this.peerConnections[id].close();
      delete this.peerConnections[id];
    }

    if (this.remoteAudioElements[id]) {
      this.remoteAudioElements[id].remove();
      delete this.remoteAudioElements[id];
    }
  }

  destroy() {
    Object.keys(this.peerConnections).forEach(id => this._removePeer(id));

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
    }

    // Don’t disconnect the socket — owned by NetworkManager
  }

  setPlayerGetter(getterFn) {
    this.getPlayerPosition = getterFn;
  }
}
