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

      source.connect(this.gainNode);

      const dest = this.audioContext.createMediaStreamDestination();
      this.gainNode.connect(dest);

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

    this.socket.on('user-left', (id) => {
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
      const audio = document.createElement('audio');
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.volume = 0;
      document.body.appendChild(audio);

      this.remoteAudioElements[id] = audio;
    };

    return pc;
  }

  setMicVolume(value) {
    if (this.gainNode) {
      this.gainNode.gain.value = Phaser.Math.Clamp(value, 0, 1);
    }
  }

  updateVolumes() {
    const selfPos = this.getPlayerPosition();
    if (!selfPos) return;

    for (const [id, audio] of Object.entries(this.remoteAudioElements)) {
      const remote = this.getRemotePlayerById(id);

      if (!remote) {
        console.warn(`🔇 Remote player not found: ${id}`);
        continue;
      }

      const dist = Phaser.Math.Distance.Between(selfPos.x, selfPos.y, remote.x, remote.y);
      audio.volume = dist > this.maxDistance
        ? 0
        : (1 - dist / this.maxDistance) * GameManager.volume.voice;
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
