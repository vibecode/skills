import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Alert',
};
export default meta;

type Story = StoryObj;

export const Destructive: Story = {
  render: () => `
    <div class="ios-alert" style="position:static;transform:none;">
      <div class="ios-alert-content">
        <p class="ios-alert-title">Delete Item?</p>
        <p class="ios-alert-message">This action cannot be undone.</p>
      </div>
      <div class="ios-alert-actions">
        <button class="ios-alert-action ios-alert-action-primary">Cancel</button>
        <button class="ios-alert-action ios-alert-action-destructive">Delete</button>
      </div>
    </div>
  `,
};

export const Confirmation: Story = {
  render: () => `
    <div class="ios-alert" style="position:static;transform:none;">
      <div class="ios-alert-content">
        <p class="ios-alert-title">Success</p>
        <p class="ios-alert-message">Your changes have been saved.</p>
      </div>
      <div class="ios-alert-actions">
        <button class="ios-alert-action ios-alert-action-primary">OK</button>
      </div>
    </div>
  `,
};

export const TwoActions: Story = {
  render: () => `
    <div class="ios-alert" style="position:static;transform:none;">
      <div class="ios-alert-content">
        <p class="ios-alert-title">Sign Out</p>
        <p class="ios-alert-message">Are you sure you want to sign out of your account?</p>
      </div>
      <div class="ios-alert-actions">
        <button class="ios-alert-action ios-alert-action-bold">Cancel</button>
        <button class="ios-alert-action ios-alert-action-primary">Sign Out</button>
      </div>
    </div>
  `,
};

export const Stacked: Story = {
  render: () => `
    <div class="ios-alert" style="position:static;transform:none;">
      <div class="ios-alert-content">
        <p class="ios-alert-title">Choose Action</p>
        <p class="ios-alert-message">This alert has stacked buttons for multiple options.</p>
      </div>
      <div class="ios-alert-actions" style="flex-direction:column;gap:10px;">
        <button class="ios-alert-action ios-alert-action-primary">Primary</button>
        <button class="ios-alert-action ios-alert-action-destructive">Destructive</button>
        <button class="ios-alert-action">Secondary</button>
      </div>
    </div>
  `,
};
