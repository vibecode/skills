import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Progress',
};
export default meta;

type Story = StoryObj;

export const Bars: Story = {
  render: () => `
    <div class="ios-screen" style="display:flex;flex-direction:column;gap:16px;padding:16px;">
      <div>
        <p class="ios-footnote ios-label-secondary" style="margin-bottom:4px;">25%</p>
        <div class="ios-progress"><div class="ios-progress-bar" style="width:25%"></div></div>
      </div>
      <div>
        <p class="ios-footnote ios-label-secondary" style="margin-bottom:4px;">65%</p>
        <div class="ios-progress"><div class="ios-progress-bar" style="width:65%"></div></div>
      </div>
      <div>
        <p class="ios-footnote ios-label-secondary" style="margin-bottom:4px;">100%</p>
        <div class="ios-progress"><div class="ios-progress-bar" style="width:100%"></div></div>
      </div>
    </div>
  `,
};

export const Spinners: Story = {
  render: () => `
    <div class="ios-screen" style="display:flex;align-items:center;gap:24px;padding:16px;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div class="ios-spinner"></div>
        <span class="ios-caption ios-label-secondary">Standard</span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        <div class="ios-spinner ios-spinner-lg"></div>
        <span class="ios-caption ios-label-secondary">Large</span>
      </div>
    </div>
  `,
};
