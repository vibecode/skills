import type { Meta, StoryObj } from '@storybook/html-vite';
import { icon, ArrowLeft, Plus, Search, Share2, Mic } from './icons';

const meta: Meta = {
  title: 'iOS Design System/Navigation Bar',
  decorators: [
    (story) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ios-screen';
      wrapper.style.cssText = 'min-height:auto;width:393px;padding:0;background:var(--ios-bg-secondary);';
      const content = story();
      if (typeof content === 'string') wrapper.innerHTML = content;
      else if (content instanceof HTMLElement) wrapper.appendChild(content);
      return wrapper;
    }
  ],
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => `
    <div class="ios-nav-bar">
      <span class="ios-pill">${icon(ArrowLeft, 18)}</span>
      <span class="ios-nav-bar-title">Title</span>
      <span class="ios-pill ios-pill-primary">${icon(Share2, 18, 'white')}</span>
    </div>
  `,
};

export const TitleWithSubtitle: Story = {
  render: () => `
    <div class="ios-nav-bar" style="min-height:50px;">
      <span class="ios-pill">${icon(ArrowLeft, 18)}</span>
      <span class="ios-nav-bar-title">Title</span>
      <span class="ios-nav-bar-subtitle">Subtitle</span>
      <span class="ios-pill">${icon(Search, 18)}</span>
    </div>
  `,
};

export const TitleSubtitleLeft: Story = {
  render: () => `
    <div class="ios-nav-bar">
      <span class="ios-pill">${icon(ArrowLeft, 18)}</span>
      <div style="flex:1;padding-left:8px;">
        <div style="font-size:15px;font-weight:600;letter-spacing:-0.23px;line-height:18px;">Title</div>
        <div style="font-size:12px;font-weight:500;color:var(--ios-label-secondary);line-height:14px;">Subtitle</div>
      </div>
      <span class="ios-pill">${icon(Search, 18)}</span>
    </div>
  `,
};

export const LargeTitle: Story = {
  render: () => `
    <div class="ios-nav-bar">
      <span class="ios-pill">${icon(ArrowLeft, 18)}</span>
      <div style="display:flex;gap:12px;">
        <span class="ios-pill-group">
          <span class="ios-pill-icon">${icon(Search, 18)}</span>
        </span>
        <span class="ios-pill-group">
          <span class="ios-pill-icon">${icon(Search, 18)}</span>
          <span class="ios-pill-icon">${icon(Plus, 18)}</span>
          <span class="ios-pill-icon">${icon(Share2, 18)}</span>
        </span>
      </div>
    </div>
    <div class="ios-nav-bar-large">
      <span class="ios-title-large">Title</span>
      <span class="ios-nav-bar-large-subtitle">Subtitle</span>
    </div>
  `,
};

export const CompactLarge: Story = {
  render: () => `
    <div class="ios-nav-bar">
      <span class="ios-pill">${icon(ArrowLeft, 18)}</span>
      <span class="ios-title-large" style="flex:1;padding:0 8px;font-size:34px;font-weight:700;letter-spacing:0.4px;line-height:41px;">Title</span>
      <span class="ios-pill ios-pill-primary">${icon(Share2, 18, 'white')}</span>
    </div>
  `,
};

export const ModalStyle: Story = {
  render: () => `
    <div class="ios-nav-bar">
      <span class="ios-pill">Cancel</span>
      <span class="ios-nav-bar-title">New Event</span>
      <span class="ios-pill ios-pill-primary">Add</span>
    </div>
  `,
};
