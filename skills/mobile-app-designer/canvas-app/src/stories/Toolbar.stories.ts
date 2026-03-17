import type { Meta, StoryObj } from '@storybook/html-vite';
import { icon, Search, Mic, X, Share2, Edit, Plus } from './icons';

const meta: Meta = {
  title: 'iOS Design System/Toolbar',
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

export const Buttons: Story = {
  render: () => `
    <div class="ios-toolbar">
      <div style="display:flex;gap:12px;">
        <span class="ios-pill">${icon(Share2, 18)}</span>
        <span class="ios-pill">${icon(Edit, 18)}</span>
      </div>
      <div style="display:flex;gap:12px;">
        <span class="ios-pill">${icon(Search, 18)}</span>
        <span class="ios-pill">${icon(Plus, 18)}</span>
      </div>
    </div>
  `,
};

export const SearchField: Story = {
  render: () => `
    <div class="ios-toolbar" style="gap:12px;">
      <div class="ios-toolbar-search">
        <span class="ios-toolbar-search-icon">${icon(Search, 18)}</span>
        <span class="ios-toolbar-search-placeholder">Search</span>
        <span class="ios-toolbar-search-trailing">${icon(Mic, 18)}</span>
      </div>
    </div>
  `,
};

export const SearchWithDismiss: Story = {
  render: () => `
    <div class="ios-toolbar" style="gap:12px;">
      <div class="ios-toolbar-search">
        <span class="ios-toolbar-search-icon">${icon(Search, 18)}</span>
        <span class="ios-toolbar-search-placeholder">Search</span>
        <span class="ios-toolbar-search-trailing">${icon(Mic, 18)}</span>
      </div>
      <span class="ios-pill">${icon(X, 18)}</span>
    </div>
  `,
};

export const SearchWithLeading: Story = {
  render: () => `
    <div class="ios-toolbar" style="gap:12px;">
      <span class="ios-pill">${icon(Share2, 18)}</span>
      <div class="ios-toolbar-search">
        <span class="ios-toolbar-search-icon">${icon(Search, 18)}</span>
        <span class="ios-toolbar-search-placeholder">Search</span>
        <span class="ios-toolbar-search-trailing">${icon(Mic, 18)}</span>
      </div>
    </div>
  `,
};

export const ButtonsWithPageDots: Story = {
  render: () => `
    <div class="ios-toolbar" style="position:relative;">
      <span class="ios-pill">${icon(Share2, 18)}</span>
      <div class="ios-page-dots" style="position:absolute;left:50%;transform:translateX(-50%);top:4px;">
        <span class="ios-page-dot"></span>
        <span class="ios-page-dot ios-page-dot-active"></span>
        <span class="ios-page-dot"></span>
      </div>
      <span class="ios-pill">${icon(Plus, 18)}</span>
    </div>
  `,
};
