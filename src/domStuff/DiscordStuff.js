import GameManager from "../things/GameManager";


const sec = document.getElementById("discord-section");
export function setupDiscordWindow() {
    const moveDiscordButton = document.getElementById("discordHideButton");

    setTimeout(()=>sec.classList.toggle('hidden'), 5000);

    moveDiscordButton.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        sec.classList.toggle('hidden');
    })
}


export async function sendDiscordMessage(message) {
    const webhookURL = "https://discord.com/api/webhooks/1406792582197149699/xlWk4jLxvCzyILXd1E0OxcneZVhYz6Rjp8Z48A0EGtvl3rKusWT2lxCdvphSPohRqACL";

    const messageToSend = message;
    const playerName = GameManager.name.text;
    const payload = {
        content: messageToSend, // plain text
        username: playerName,          // optional, overrides webhook name
        avatar_url: "https://conduit.bar/assets/CardPistol.png"
    };

    await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
}