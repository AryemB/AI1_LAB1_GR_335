type StyleEntry = { name: string, file: string };

const styles: StyleEntry[] = [
  { name: "Biały styl", file: "/style-1.css" },
  { name: "Czarny styl", file: "/style-2.css" },
  { name: "Kolorowy styl", file: "/style-3.css" }
];

let currentStyle: StyleEntry | null = null;

function createStylesArea(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'styles-area';

  const list = document.createElement('ul');
  list.id = 'styles-list';

  styles.forEach((s, idx) => {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = '#';
    a.textContent = s.name;
    a.dataset.index = String(idx);
    a.addEventListener('click', (e) => {
      e.preventDefault();
      applyStyleByIndex(idx);
    });

    li.appendChild(a);
    list.appendChild(li);
  });

  container.appendChild(list);
  return container;
}

function getExistingStyleLink(): HTMLLinkElement | null {
  return document.querySelector('link[data-dynamic-style]') as HTMLLinkElement | null;
}

function applyStyleByIndex(index: number) {
  const style = styles[index];
  if (!style) return;

  if (currentStyle && currentStyle.file === style.file) return;

  const oldLink = getExistingStyleLink();
  if (oldLink) {
    oldLink.parentElement?.removeChild(oldLink);
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = style.file;
  link.setAttribute('data-dynamic-style', 'true');

  document.head.appendChild(link);
  currentStyle = style;

  updateSelectedUI();
}

function updateSelectedUI() {
  const anchors = document.querySelectorAll('#styles-list a');
  anchors.forEach((a) => {
    a.classList.remove('selected-style');
  });
  if (!currentStyle) return;
  const idx = styles.findIndex(s => s.file === currentStyle!.file);
  if (idx >= 0) {
    const selector = `#styles-list a[data-index="${idx}"]`;
    const el = document.querySelector(selector);
    el?.classList.add('selected-style');
  }
}

window.addEventListener('DOMContentLoaded', () => {

  document.body.style.display = 'flex';
  document.body.style.flexDirection = 'column';
  document.body.style.minHeight = '100vh';
  document.body.style.margin = '0';

  const area = createStylesArea();
  document.body.appendChild(area);

  applyStyleByIndex(0);

  const styleTag = document.createElement('style');
  styleTag.textContent = `
  #styles-area {
    width: 100%;
    background: #d9d9d9;
    border-top: 1px solid #bcbcbc;

    padding: 20px 0;

    box-sizing: border-box;

    margin-top: auto;
  }

  #styles-list {
    width: 90%;
    max-width: 500px;
    margin: 0 auto;

    padding: 0;
    list-style: none;

    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  #styles-list li {
    margin: 0;
    padding: 0;
  }

  #styles-list a {
  
    display: block;
    width: 100%;

    height: 42px;
    line-height: 42px;

    background: #f3f3f3;
    border: 1px solid #a0a0a0;
    border-radius: 8px;

    color: #333;
    text-align: center;
    text-decoration: none;
    cursor: pointer;

    font-size: 16px;
    font-family: Arial, sans-serif;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  #styles-list a:hover {
    background: #e7e7e7;
  }

  #styles-list a.selected-style {
    background: #ffffff;
    border-color: #7a7a7a;
    font-weight: bold;
  }
  `;
  document.head.appendChild(styleTag);
});
