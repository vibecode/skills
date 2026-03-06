import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Separator',
};
export default meta;

type Story = StoryObj;

export const Inset: Story = {
  render: () => `
    <div>
      <p class="ios-body">Content above</p>
      <div class="ios-separator" style="margin-top:12px;margin-bottom:12px;"></div>
      <p class="ios-body">Content below (inset separator)</p>
    </div>
  `,
};

export const FullWidth: Story = {
  render: () => `
    <div style="margin:-16px;">
      <p class="ios-body" style="padding:16px;">Content above</p>
      <div class="ios-separator ios-separator-full"></div>
      <p class="ios-body" style="padding:16px;">Content below (full-width separator)</p>
    </div>
  `,
};
