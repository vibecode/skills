import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Segmented Control',
  decorators: [
    (story) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ios-screen';
      wrapper.style.cssText = 'min-height:auto;width:393px;padding:16px;';
      const content = story();
      if (typeof content === 'string') wrapper.innerHTML = content;
      else if (content instanceof HTMLElement) wrapper.appendChild(content);
      return wrapper;
    }
  ],
};
export default meta;

type Story = StoryObj;

export const TwoSegments: Story = {
  render: () => `
    <div class="ios-segmented-control">
      <button class="ios-segment ios-segment-active">All</button>
      <button class="ios-segment">Missed</button>
    </div>
  `,
};

export const ThreeSegments: Story = {
  render: () => `
    <div class="ios-segmented-control">
      <button class="ios-segment ios-segment-active">Day</button>
      <button class="ios-segment">Week</button>
      <button class="ios-segment">Month</button>
    </div>
  `,
};

export const FourSegments: Story = {
  render: () => `
    <div class="ios-segmented-control">
      <button class="ios-segment">S</button>
      <button class="ios-segment ios-segment-active">M</button>
      <button class="ios-segment">L</button>
      <button class="ios-segment">XL</button>
    </div>
  `,
};
