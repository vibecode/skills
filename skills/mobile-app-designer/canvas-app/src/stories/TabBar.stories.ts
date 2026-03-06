import type { Meta, StoryObj } from '@storybook/html-vite';
import { icon, Home, Search, User, MessageCircle, Settings, Smartphone } from './icons';

const meta: Meta = {
  title: 'iOS Design System/Tab Bar',
};
export default meta;

type Story = StoryObj;

export const ThreeTabs: Story = {
  render: () => `
    <div style="margin:-16px;">
      <div class="ios-tab-bar">
        <a class="ios-tab-bar-item ios-tab-bar-item-active">
          <span class="ios-tab-bar-icon">${icon(Home, 22)}</span>
          <span>Home</span>
        </a>
        <a class="ios-tab-bar-item">
          <span class="ios-tab-bar-icon">${icon(Search, 22)}</span>
          <span>Search</span>
        </a>
        <a class="ios-tab-bar-item">
          <span class="ios-tab-bar-icon">${icon(User, 22)}</span>
          <span>Profile</span>
        </a>
      </div>
    </div>
  `,
};

export const FiveTabs: Story = {
  render: () => `
    <div style="margin:-16px;">
      <div class="ios-tab-bar">
        <a class="ios-tab-bar-item ios-tab-bar-item-active">
          <span class="ios-tab-bar-icon">${icon(Home, 22)}</span>
          <span>Home</span>
        </a>
        <a class="ios-tab-bar-item">
          <span class="ios-tab-bar-icon">${icon(Search, 22)}</span>
          <span>Search</span>
        </a>
        <a class="ios-tab-bar-item">
          <span class="ios-tab-bar-icon">${icon(Smartphone, 22)}</span>
          <span>Feed</span>
        </a>
        <a class="ios-tab-bar-item">
          <span class="ios-tab-bar-icon">${icon(MessageCircle, 22)}</span>
          <span>Messages</span>
        </a>
        <a class="ios-tab-bar-item">
          <span class="ios-tab-bar-icon">${icon(User, 22)}</span>
          <span>Profile</span>
        </a>
      </div>
    </div>
  `,
};

export const WithBadge: Story = {
  render: () => `
    <div style="margin:-16px;">
      <div class="ios-tab-bar">
        <a class="ios-tab-bar-item ios-tab-bar-item-active">
          <span class="ios-tab-bar-icon">${icon(Home, 22)}</span>
          <span>Home</span>
        </a>
        <a class="ios-tab-bar-item" style="position:relative;">
          <span class="ios-tab-bar-icon">${icon(MessageCircle, 22)}</span>
          <span class="ios-badge" style="position:absolute;top:2px;right:calc(50% - 20px);">3</span>
          <span>Chat</span>
        </a>
        <a class="ios-tab-bar-item">
          <span class="ios-tab-bar-icon">${icon(Settings, 22)}</span>
          <span>Settings</span>
        </a>
      </div>
    </div>
  `,
};
