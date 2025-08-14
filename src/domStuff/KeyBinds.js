import './keyBindsStyle.css';

let kbGrid = null;

export function setupKeybindWindow() {
    const section = document.getElementById('kb-section');

    kbGrid = document.createElement('div');
    kbGrid.className = 'kb-grid';

    section.appendChild(kbGrid);


    // addButton('KeyUnpressed', 'KeyF', 'Int', 1, 1);
    // addButton('KeyUnpressed', 'KeyF', 'Int', 1, 2);
}

export function addButton(imgSrc, key, action = 'Interact', row = 1, col = 1, wid = '60px', labelOverride) {
    const button = document.createElement('div');
    button.className = 'kb-button';
    button.style.width = wid;

    button.style.gridRow = row;
    button.style.gridColumn = col;

    const img = document.createElement('img');
    img.className = 'kb-image';
    img.src = `assets/${imgSrc}.png`;

    const label = document.createElement('div');
    label.className = 'kb-label';
    if (labelOverride) {
        label.textContent = labelOverride;
    } else {
        label.textContent = key.replace('Key', '');
    }

    const info = document.createElement('div');
    info.className = 'kb-info';
    info.textContent = action;

    button.appendChild(img);
    button.appendChild(label);
    button.appendChild(info);
    kbGrid.appendChild(button);

    document.addEventListener('keydown', (e) => {
        if (e.code === key) {
            img.src = 'assets/KeyPressed.png';
            label.style.transform = 'translate(-50%, -60%)';
        }
    })
    document.addEventListener('keyup', (e) => {
        if (e.code === key) {
            img.src = 'assets/KeyUnpressed.png';
            label.style.transform = 'translate(-50%, -95%)';
        }
    })
}