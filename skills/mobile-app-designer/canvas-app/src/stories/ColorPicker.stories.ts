import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Color Picker',
  decorators: [
    (story) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ios-screen';
      wrapper.style.cssText = 'min-height:auto;width:393px;padding:0;background:var(--ios-bg-secondary);position:relative;';
      const content = story();
      if (typeof content === 'string') wrapper.innerHTML = content;
      else if (content instanceof HTMLElement) wrapper.appendChild(content);
      return wrapper;
    }
  ],
};
export default meta;

type Story = StoryObj;

// Row 1: grayscale, Rows 2-10: hue columns (red, orange, yellow, lime, green, teal, cyan, blue, indigo, purple, pink)
const gridColors = [
  // Row 1 — grayscale
  ['#000000','#1a1a1a','#333333','#4d4d4d','#666666','#808080','#999999','#b3b3b3','#cccccc','#d9d9d9','#e6e6e6','#ffffff'],
  // Row 2 — saturated
  ['#ff3b30','#ff9500','#ffcc00','#a8d600','#34c759','#30b0c7','#00c7be','#007aff','#5856d6','#af52de','#ff2d55','#ff6482'],
  // Row 3
  ['#ff6259','#ffad33','#ffd633','#bde035','#5dd47b','#52c0d4','#33d1ca','#3395ff','#7a78e0','#c075e8','#ff577a','#ff839b'],
  // Row 4
  ['#ff8a80','#ffc266','#ffe066','#d0ea6a','#86e29d','#7ad0e1','#66dbd6','#66b0ff','#9c9bea','#d098f2','#ff809f','#ffa2b4'],
  // Row 5
  ['#ffb3ad','#ffd699','#ffeb99','#e3f49f','#afedbf','#a2e0ee','#99e5e2','#99cbff','#bdbdf4','#e0bbfc','#ffaac4','#ffc1cd'],
  // Row 6
  ['#ffdcd9','#ffebcc','#fff5cc','#f1fad4','#d7f6df','#caf0fb','#ccefee','#cce5ff','#dedefa','#f0ddfe','#ffd5e2','#ffe0e6'],
  // Row 7
  ['#cc2f26','#cc7700','#cca300','#86ab00','#2a9f47','#267d9f','#009f98','#0062cc','#4645ab','#8c42b2','#cc2444','#cc5068'],
  // Row 8
  ['#99231d','#995a00','#997a00','#658000','#1f7735','#1d5e77','#007772','#004a99','#343480','#693186','#991b33','#993c4e'],
  // Row 9
  ['#661813','#664c00','#665200','#435600','#155023','#133f50','#00504c','#003166','#232256','#46215a','#661222','#663035'],
  // Row 10
  ['#330c0a','#332600','#332900','#222b00','#0a2812','#0a2028','#002826','#001933','#11112b','#23102d','#330911','#33181a'],
];

function renderGrid(selectedRow = 1, selectedCol = 7): string {
  const swatches = gridColors.map((row, r) =>
    row.map((color, c) => {
      const selected = r === selectedRow && c === selectedCol ? ' ios-color-picker-swatch-selected' : '';
      return `<div class="ios-color-picker-swatch${selected}" style="background:${color};"></div>`;
    }).join('')
  ).join('');
  return `<div class="ios-color-picker-grid">${swatches}</div>`;
}

export const GridView: Story = {
  render: () => `
    <div style="position:relative;height:706px;">
      <div class="ios-color-picker" style="position:static;transform:none;">
        <div class="ios-color-picker-grabber"></div>
        <div class="ios-color-picker-segments">
          <div class="ios-color-picker-segment ios-color-picker-segment-active">Grid</div>
          <div class="ios-color-picker-segment">Spectrum</div>
          <div class="ios-color-picker-segment">Sliders</div>
        </div>
        ${renderGrid(1, 7)}
      </div>
    </div>
  `,
};

export const WithOpacity: Story = {
  render: () => `
    <div style="position:relative;height:706px;">
      <div class="ios-color-picker" style="position:static;transform:none;">
        <div class="ios-color-picker-grabber"></div>
        <div class="ios-color-picker-segments">
          <div class="ios-color-picker-segment ios-color-picker-segment-active">Grid</div>
          <div class="ios-color-picker-segment">Spectrum</div>
          <div class="ios-color-picker-segment">Sliders</div>
        </div>
        ${renderGrid(1, 7)}
        <div class="ios-color-picker-opacity">
          <div class="ios-color-picker-opacity-gradient" style="background:linear-gradient(to right, transparent, #007aff);"></div>
          <div class="ios-color-picker-opacity-knob" style="left:calc(80% - 18px);"></div>
        </div>
      </div>
    </div>
  `,
};

export const SavedSwatches: Story = {
  render: () => `
    <div style="position:relative;height:706px;">
      <div class="ios-color-picker" style="position:static;transform:none;">
        <div class="ios-color-picker-grabber"></div>
        <div class="ios-color-picker-segments">
          <div class="ios-color-picker-segment ios-color-picker-segment-active">Grid</div>
          <div class="ios-color-picker-segment">Spectrum</div>
          <div class="ios-color-picker-segment">Sliders</div>
        </div>
        ${renderGrid(1, 7)}
        <div class="ios-color-picker-opacity">
          <div class="ios-color-picker-opacity-gradient" style="background:linear-gradient(to right, transparent, #007aff);"></div>
          <div class="ios-color-picker-opacity-knob" style="left:calc(80% - 18px);"></div>
        </div>
        <div class="ios-color-picker-saved">
          <div class="ios-color-picker-preview" style="background:#007aff;"></div>
          <div class="ios-color-picker-saved-dots">
            <div class="ios-color-picker-dot ios-color-picker-dot-selected" style="background:#007aff;"></div>
            <div class="ios-color-picker-dot" style="background:#ff3b30;"></div>
            <div class="ios-color-picker-dot" style="background:#34c759;"></div>
            <div class="ios-color-picker-dot" style="background:#ff9500;"></div>
            <div class="ios-color-picker-dot" style="background:#af52de;"></div>
            <div class="ios-color-picker-dot" style="background:#ff2d55;"></div>
          </div>
        </div>
      </div>
    </div>
  `,
};
