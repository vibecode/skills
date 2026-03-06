import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Toggle',
};
export default meta;

type Story = StoryObj;

export const Off: Story = {
  render: () => `
    <div style="display:flex;align-items:center;gap:12px;">
      <span class="ios-body">Airplane Mode</span>
      <div class="ios-toggle"></div>
    </div>
  `,
};

export const On: Story = {
  render: () => `
    <div style="display:flex;align-items:center;gap:12px;">
      <span class="ios-body">Wi-Fi</span>
      <div class="ios-toggle ios-toggle-on"></div>
    </div>
  `,
};

export const BothStates: Story = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="ios-body" style="width:60px;">Off</span>
        <div class="ios-toggle"></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="ios-body" style="width:60px;">On</span>
        <div class="ios-toggle ios-toggle-on"></div>
      </div>
    </div>
  `,
};
