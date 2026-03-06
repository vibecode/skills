import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Modal',
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

export const Welcome: Story = {
  render: () => `
    <div class="ios-modal">
      <div style="padding:24px 16px;text-align:center;">
        <p class="ios-title-2" style="margin-top:12px;">Welcome</p>
        <p class="ios-body ios-label-secondary" style="margin-top:8px;">Thanks for joining us. Let's get started.</p>
        <button class="ios-btn ios-btn-filled ios-btn-lg" style="margin-top:20px;">Get Started</button>
      </div>
    </div>
  `,
};

export const WithForm: Story = {
  render: () => `
    <div class="ios-modal">
      <div class="ios-nav-bar">
        <span class="ios-btn-plain ios-blue">Cancel</span>
        <span class="ios-nav-bar-title">New Event</span>
        <span class="ios-btn-plain ios-blue" style="font-weight:700;">Add</span>
      </div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
        <input class="ios-text-field" placeholder="Event name" />
        <input class="ios-text-field" placeholder="Location" />
      </div>
    </div>
  `,
};
