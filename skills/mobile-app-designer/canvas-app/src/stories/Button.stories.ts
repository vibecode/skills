import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Button',
};
export default meta;

type Story = StoryObj;

export const Filled: Story = {
  render: () => `
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="ios-btn ios-btn-filled">Default</button>
      <button class="ios-btn ios-btn-filled ios-btn-sm">Small</button>
    </div>
  `,
};

export const FilledLarge: Story = {
  render: () => '<button class="ios-btn ios-btn-filled ios-btn-lg">Sign In</button>',
};

export const Gray: Story = {
  render: () => `
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="ios-btn ios-btn-gray">Cancel</button>
      <button class="ios-btn ios-btn-gray ios-btn-sm">Small</button>
    </div>
  `,
};

export const Tinted: Story = {
  render: () => `
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="ios-btn ios-btn-tinted">Add to Library</button>
      <button class="ios-btn ios-btn-tinted ios-btn-sm">Small</button>
    </div>
  `,
};

export const Plain: Story = {
  render: () => `
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="ios-btn ios-btn-plain">Learn More</button>
      <button class="ios-btn ios-btn-plain ios-btn-destructive">Delete</button>
    </div>
  `,
};

export const DestructiveLarge: Story = {
  render: () => '<button class="ios-btn ios-btn-lg" style="background:var(--ios-red);color:white;">Delete Account</button>',
};

export const AllVariants: Story = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <p class="ios-caption ios-label-secondary" style="margin-bottom:8px;">FILLED</p>
        <button class="ios-btn ios-btn-filled">Continue</button>
      </div>
      <div>
        <p class="ios-caption ios-label-secondary" style="margin-bottom:8px;">GRAY</p>
        <button class="ios-btn ios-btn-gray">Cancel</button>
      </div>
      <div>
        <p class="ios-caption ios-label-secondary" style="margin-bottom:8px;">TINTED</p>
        <button class="ios-btn ios-btn-tinted">Add to Library</button>
      </div>
      <div>
        <p class="ios-caption ios-label-secondary" style="margin-bottom:8px;">PLAIN</p>
        <button class="ios-btn ios-btn-plain">Learn More</button>
      </div>
      <div>
        <p class="ios-caption ios-label-secondary" style="margin-bottom:8px;">SMALL</p>
        <div style="display:flex;gap:8px;">
          <button class="ios-btn ios-btn-filled ios-btn-sm">Follow</button>
          <button class="ios-btn ios-btn-gray ios-btn-sm">Edit</button>
          <button class="ios-btn ios-btn-tinted ios-btn-sm">Add</button>
        </div>
      </div>
      <div>
        <p class="ios-caption ios-label-secondary" style="margin-bottom:8px;">LARGE (FULL WIDTH)</p>
        <button class="ios-btn ios-btn-filled ios-btn-lg">Sign In</button>
      </div>
    </div>
  `,
};
