import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Search Bar',
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => `
    <div class="ios-search-bar">
      <input class="ios-search-bar-input" placeholder="Search" />
    </div>
  `,
};

export const WithValue: Story = {
  render: () => `
    <div class="ios-search-bar">
      <input class="ios-search-bar-input" value="Coffee shops" />
    </div>
  `,
};
