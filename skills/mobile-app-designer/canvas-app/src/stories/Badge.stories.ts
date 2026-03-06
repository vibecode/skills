import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Badge',
};
export default meta;

type Story = StoryObj;

export const Variants: Story = {
  render: () => `
    <div class="ios-screen" style="display:flex;align-items:center;gap:12px;padding:16px;">
      <span class="ios-badge">1</span>
      <span class="ios-badge">5</span>
      <span class="ios-badge">42</span>
      <span class="ios-badge">99+</span>
    </div>
  `,
};
