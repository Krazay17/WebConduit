export default class VoiceChatManager {
  constructor(socket, getPlayerPosition, getRemotePlayerById) {
    this.socket = socket;
    this.getPlayerPosition = getPlayerPosition;
    this.getRemotePlayerById = getRemotePlayerById;

    this.peerConnections = {};
    this.remoteAudioElements = {};
    this.localStream = null;

    this.maxDistance = 800;
    this.voiceVolume = 1;

    this._initMic();
    this._setupSocketHandlers();
  }

  async _initMic() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.socket.emit('join-voice');
    } catch (e) {
      console.error('Mic access failed:', e);
    }
  }

  _setupSocketHandlers() {
    this.socket.on('user-joined', async (id) => {
      if (!this.localStream) return;

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
    const pc = new RTCPeerConnection();

    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream);
    });

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

  updateVolumes() {
    const selfPos = this.getPlayerPosition();
    if (!selfPos) return;

    for (const [id, audio] of Object.entries(this.remoteAudioElements)) {
      const remote = this.getRemotePlayerById(id);
      console.log(remote);
      if (!remote) continue;

      const dist = Phaser.Math.Distance.Between(selfPos.x, selfPos.y, remote.x, remote.y);
      audio.volume = dist > this.maxDistance ? 0 : (1 - dist / this.maxDistance) * this.voiceVolume;
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
    for (const id in this.peerConnections) {
      this._removePeer(id);
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Do NOT disconnect the socket — it's owned by the main app
  }

  setPlayerGetter(getterFn) {
    this.getPlayerPosition = getterFn;
  }
}
