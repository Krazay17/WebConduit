// iconGrid.js
export function setupIconGrid(containerId, icons, onClickHandler) {
  const container = document.getElementById(containerId);
  if (!container) return console.warn(`Container ${containerId} not found`);

  container.innerHTML = ''; // clear existing content

  icons.forEach(icon => {
    const img = document.createElement('img');
    img.src = icon.src;
    img.alt = icon.name ?? '';
    img.title = icon.name ?? '';
    img.classList.add('icon');
    img.dataset.value = icon.value;

    img.addEventListener('click', () => {
      onClickHandler(icon);
    });

    container.appendChild(img);
  });
}
