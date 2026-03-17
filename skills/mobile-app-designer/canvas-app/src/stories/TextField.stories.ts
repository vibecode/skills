import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Text Field',
};
export default meta;

type Story = StoryObj;

export const Empty: Story = {
  render: () => '<input class="ios-text-field" placeholder="Email address" />',
};

export const Filled: Story = {
  render: () => '<input class="ios-text-field" value="john@example.com" />',
};

export const Password: Story = {
  render: () => '<input class="ios-text-field" placeholder="Password" type="password" />',
};

export const FormGroup: Story = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:12px;">
      <input class="ios-text-field" placeholder="First name" />
      <input class="ios-text-field" placeholder="Last name" />
      <input class="ios-text-field" placeholder="Email address" />
      <input class="ios-text-field" placeholder="Password" type="password" />
    </div>
  `,
};
