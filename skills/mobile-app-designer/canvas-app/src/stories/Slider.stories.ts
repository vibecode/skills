import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Slider',
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => `
    <div class="ios-slider">
      <div class="ios-slider-track">
        <div class="ios-slider-track-fill" style="width:50%"></div>
        <div class="ios-slider-thumb" style="left:50%"></div>
      </div>
    </div>
  `,
};

export const Empty: Story = {
  render: () => `
    <div class="ios-slider">
      <div class="ios-slider-track">
        <div class="ios-slider-track-fill" style="width:0%"></div>
        <div class="ios-slider-thumb" style="left:0%"></div>
      </div>
    </div>
  `,
};

export const Full: Story = {
  render: () => `
    <div class="ios-slider">
      <div class="ios-slider-track">
        <div class="ios-slider-track-fill" style="width:100%"></div>
        <div class="ios-slider-thumb" style="left:100%"></div>
      </div>
    </div>
  `,
};

export const WithMinMaxLabels: Story = {
  render: () => `
    <div style="display:flex;align-items:center;gap:8px;padding:0 16px;">
      <span class="ios-caption ios-label-secondary">0</span>
      <div class="ios-slider" style="padding:0;">
        <div class="ios-slider-track">
          <div class="ios-slider-track-fill" style="width:30%"></div>
          <div class="ios-slider-thumb" style="left:30%"></div>
        </div>
      </div>
      <span class="ios-caption ios-label-secondary">100</span>
    </div>
  `,
};
