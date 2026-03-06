import type { Meta, StoryObj } from '@storybook/html-vite';
import { icon, Music } from './icons';

const meta: Meta = {
  title: 'iOS Design System/Card',
  decorators: [
    (story) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ios-screen';
      wrapper.style.cssText = 'min-height:auto;width:393px;padding:16px;background:var(--ios-bg-secondary);';
      const content = story();
      if (typeof content === 'string') wrapper.innerHTML = content;
      else if (content instanceof HTMLElement) wrapper.appendChild(content);
      return wrapper;
    }
  ],
};
export default meta;

type Story = StoryObj;

export const Simple: Story = {
  render: () => `
    <div class="ios-card">
      <p class="ios-headline">Today's Summary</p>
      <p class="ios-body" style="margin-top:4px;">You completed 5 tasks and earned 120 points.</p>
    </div>
  `,
};

export const WithImage: Story = {
  render: () => `
    <div class="ios-card ios-card-image">
      <div class="ios-card-image-header">
        ${icon(Music, 48, 'white')}
      </div>
      <div class="ios-card-image-body">
        <p class="ios-headline">Now Playing</p>
        <p class="ios-subheadline ios-label-secondary">Artist — Album</p>
      </div>
    </div>
  `,
};

export const WithAction: Story = {
  render: () => `
    <div class="ios-card">
      <p class="ios-headline">Upgrade to Pro</p>
      <p class="ios-body ios-label-secondary" style="margin-top:4px;">Unlock all features and remove limits.</p>
      <button class="ios-btn ios-btn-filled" style="margin-top:12px;">Upgrade Now</button>
    </div>
  `,
};
