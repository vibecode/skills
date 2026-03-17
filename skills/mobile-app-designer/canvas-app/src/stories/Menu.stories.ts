import type { Meta, StoryObj } from '@storybook/html-vite';
import { icon, Copy, Clipboard, Download, Upload, Trash2, SortAsc, MoreHorizontal } from './icons';

const meta: Meta = {
  title: 'iOS Design System/Menu',
};
export default meta;

type Story = StoryObj;

export const StandardMenu: Story = {
  render: () => `
    <div class="ios-menu">
      <div class="ios-menu-item">
        <span class="ios-menu-item-label">Copy</span>
      </div>
      <div class="ios-menu-item">
        <span class="ios-menu-item-label">Paste</span>
      </div>
      <div class="ios-menu-item">
        <span class="ios-menu-item-label">Duplicate</span>
      </div>
      <div class="ios-menu-separator"></div>
      <div class="ios-menu-item ios-menu-item-destructive">
        <span class="ios-menu-item-label">Delete</span>
      </div>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => `
    <div class="ios-menu">
      <div class="ios-menu-item">
        <span class="ios-menu-icon">${icon(Copy, 17)}</span>
        <span class="ios-menu-item-label">Copy</span>
      </div>
      <div class="ios-menu-item">
        <span class="ios-menu-icon">${icon(Clipboard, 17)}</span>
        <span class="ios-menu-item-label">Paste</span>
      </div>
      <div class="ios-menu-item">
        <span class="ios-menu-icon">${icon(Download, 17)}</span>
        <span class="ios-menu-item-label">Save to Photos</span>
      </div>
      <div class="ios-menu-separator"></div>
      <div class="ios-menu-item">
        <span class="ios-menu-icon">${icon(Upload, 17)}</span>
        <span class="ios-menu-item-label">Share</span>
      </div>
      <div class="ios-menu-separator"></div>
      <div class="ios-menu-item ios-menu-item-destructive">
        <span class="ios-menu-icon">${icon(Trash2, 17)}</span>
        <span class="ios-menu-item-label">Delete</span>
      </div>
    </div>
  `,
};

export const EditBar: Story = {
  render: () => `
    <div class="ios-menu-edit-bar">
      <span class="ios-menu-action">Cut</span>
      <span class="ios-menu-action">Copy</span>
      <span class="ios-menu-action">Paste</span>
      <span class="ios-menu-action">Select All</span>
      <span class="ios-menu-action">Look Up</span>
    </div>
  `,
};

export const WithSubmenu: Story = {
  render: () => `
    <div class="ios-menu">
      <div class="ios-menu-item">
        <span class="ios-menu-icon">${icon(Copy, 17)}</span>
        <span class="ios-menu-item-label">Copy</span>
      </div>
      <div class="ios-menu-item">
        <span class="ios-menu-icon">${icon(Clipboard, 17)}</span>
        <span class="ios-menu-item-label">Paste</span>
      </div>
      <div class="ios-menu-separator"></div>
      <div class="ios-menu-item">
        <span class="ios-menu-icon">${icon(SortAsc, 17)}</span>
        <span class="ios-menu-item-label">Sort By</span>
        <span class="ios-menu-submenu-chevron">›</span>
      </div>
      <div class="ios-menu-item">
        <span class="ios-menu-icon">${icon(MoreHorizontal, 17)}</span>
        <span class="ios-menu-item-label">Move To</span>
        <span class="ios-menu-submenu-chevron">›</span>
      </div>
      <div class="ios-menu-separator"></div>
      <div class="ios-menu-item ios-menu-item-destructive">
        <span class="ios-menu-icon">${icon(Trash2, 17)}</span>
        <span class="ios-menu-item-label">Delete</span>
      </div>
    </div>
  `,
};
