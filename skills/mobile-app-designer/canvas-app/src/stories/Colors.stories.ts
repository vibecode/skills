import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Colors',
};
export default meta;

type Story = StoryObj;

export const SystemColors: Story = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
      ${[
        ['var(--ios-blue)', 'Blue'],
        ['var(--ios-green)', 'Green'],
        ['var(--ios-red)', 'Red'],
        ['var(--ios-orange)', 'Orange'],
        ['var(--ios-yellow)', 'Yellow'],
        ['var(--ios-purple)', 'Purple'],
        ['var(--ios-pink)', 'Pink'],
        ['var(--ios-teal)', 'Teal'],
        ['var(--ios-indigo)', 'Indigo'],
      ].map(([color, name]) => `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div style="width:48px;height:48px;border-radius:10px;background:${color};"></div>
          <span class="ios-caption">${name}</span>
        </div>
      `).join('')}
    </div>
  `,
};

export const Backgrounds: Story = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:8px;">
      <div style="padding:12px 16px;border-radius:10px;background:var(--ios-bg);border:0.5px solid var(--ios-separator);">
        <span class="ios-body">Primary — var(--ios-bg)</span>
      </div>
      <div style="padding:12px 16px;border-radius:10px;background:var(--ios-bg-secondary);">
        <span class="ios-body">Secondary — var(--ios-bg-secondary)</span>
      </div>
      <div style="padding:12px 16px;border-radius:10px;background:var(--ios-bg-tertiary);">
        <span class="ios-body">Tertiary — var(--ios-bg-tertiary)</span>
      </div>
    </div>
  `,
};

export const TextColors: Story = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:8px;">
      <span class="ios-body">Primary Label</span>
      <span class="ios-body ios-label-secondary">Secondary Label</span>
      <span class="ios-body ios-label-tertiary">Tertiary Label</span>
      <div style="height:0.5px;background:var(--ios-separator);margin:4px 0;"></div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;">
        <span class="ios-headline ios-blue">Blue</span>
        <span class="ios-headline ios-green">Green</span>
        <span class="ios-headline ios-red">Red</span>
        <span class="ios-headline ios-orange">Orange</span>
        <span class="ios-headline ios-purple">Purple</span>
        <span class="ios-headline ios-pink">Pink</span>
        <span class="ios-headline ios-teal">Teal</span>
        <span class="ios-headline ios-indigo">Indigo</span>
      </div>
    </div>
  `,
};
