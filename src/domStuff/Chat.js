import GameManager from "../things/GameManager";
import NetworkManager from "../things/NetworkManager";
import { sendDiscordMessage } from "./DiscordStuff";

const sect = document.getElementById('chat-section');
const messages = document.getElementById('chatMessages');
const textInput = document.getElementById('chatInput');

let isChatting = false;
let message = "";
let network;
let scene;

export function chatNetwork() {
    network = NetworkManager.instance;
    const netMessages = (d) => {
        addMessage(d.message)
    }

    network.socket.on('globalChatMessageUpdate', ({ id, data }) => {
        netMessages(data);
    });
}

export function getChatting() {
    return isChatting;
}

export function setScene(s) {
    scene = s;
}

export default function setupChat() {
    let fadeTimer;
    textInput.addEventListener('focus', () => {
        isChatting = true;
        scene.input.keyboard.resetKeys();
        scene.input.keyboard.enabled = false;
        clearTimeout(fadeTimer);
        messages.classList.add('active');
        messages.scrollTop = messages.scrollHeight;
    });

    textInput.addEventListener('blur', () => {
        isChatting = false;
        scene.input.keyboard.resetKeys();
        scene.input.keyboard.enabled = true;
        fadeTimer = setTimeout(()=> {
        messages.classList.remove('active');
        messages.scrollTop = messages.scrollHeight;
        },2000);
    });

    document.addEventListener('mousedown', (e) => {
        textInput.blur();
    })
    textInput.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    })
    textInput.addEventListener('mouseup', (e) => {
        e.stopPropagation();
    })

    window.addEventListener('keydown', (e) => {
        if (isChatting) {
            console.log(e.code);
            if (e.code === 'Escape') {
                e.preventDefault();
                textInput.blur();
            }
        }

        if (e.code === 'Enter') {
            e.preventDefault(); // prevents default behavior like newline
            if (!isChatting) {
                textInput.focus();
            } else {
                message = textInput.value; // use .value for input/textarea
                if (/^\s*$/.test(message)) {
                    textInput.value = ""; // clear after sending
                    textInput.blur();
                    return;
                };
                sendDiscordMessage(message);
                message = GameManager.name.text + ": " + textInput.value; // use .value for input/textarea
                addMessage(message);
                network?.socket?.emit('globalChatMessageRequest', { player: GameManager.name.text, message });
                textInput.value = ""; // clear after sending
                textInput.blur();
            }
        }
    });
}


function addMessage(tx) {
    const newMessage = document.createElement('div');
    newMessage.className = 'chatMessage';
    newMessage.textContent = tx;
    messages.appendChild(newMessage);
    messages.scrollTop = messages.scrollHeight;
}
