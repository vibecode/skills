import type { Meta, StoryObj } from '@storybook/html-vite';
import { icon, Copy, MapPin, Upload, Edit, Heart, Link, Bookmark, Eye, Trash2, Clipboard } from './icons';

const meta: Meta = {
  title: 'iOS Design System/Context Menu',
};
export default meta;

type Story = StoryObj;

export const Standard: Story = {
  render: () => `
    <div class="ios-context-menu">
      <div class="ios-context-menu-items">
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Copy, 17)}</span>
          Copy
        </div>
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(MapPin, 17)}</span>
          Pin
        </div>
        <div class="ios-context-menu-separator"></div>
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Upload, 17)}</span>
          Share
        </div>
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Edit, 17)}</span>
          Edit
        </div>
      </div>
    </div>
  `,
};

export const WithPreview: Story = {
  render: () => `
    <div class="ios-context-menu">
      <div class="ios-context-menu-preview">Preview</div>
      <div class="ios-context-menu-actions">
        <div class="ios-context-menu-action">
          <span class="ios-context-menu-action-icon">${icon(Heart, 13)}</span>
          <span class="ios-context-menu-action-label">Like</span>
        </div>
        <div class="ios-context-menu-action">
          <span class="ios-context-menu-action-icon">${icon(Link, 13)}</span>
          <span class="ios-context-menu-action-label">Copy</span>
        </div>
        <div class="ios-context-menu-action">
          <span class="ios-context-menu-action-icon">${icon(Upload, 13)}</span>
          <span class="ios-context-menu-action-label">Share</span>
        </div>
      </div>
      <div class="ios-context-menu-items">
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Clipboard, 17)}</span>
          Copy
        </div>
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Bookmark, 17)}</span>
          Save
        </div>
        <div class="ios-context-menu-separator"></div>
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Eye, 17)}</span>
          Hide
        </div>
      </div>
    </div>
  `,
};

export const WithDestructive: Story = {
  render: () => `
    <div class="ios-context-menu">
      <div class="ios-context-menu-items">
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Edit, 17)}</span>
          Edit
        </div>
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Copy, 17)}</span>
          Duplicate
        </div>
        <div class="ios-context-menu-separator"></div>
        <div class="ios-context-menu-section-title">Danger Zone</div>
        <div class="ios-context-menu-item ios-context-menu-item-destructive">
          <span class="ios-context-menu-item-icon">${icon(Trash2, 17)}</span>
          Delete
        </div>
      </div>
    </div>
  `,
};

export const WithDisabled: Story = {
  render: () => `
    <div class="ios-context-menu">
      <div class="ios-context-menu-items">
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(Copy, 17)}</span>
          Copy
        </div>
        <div class="ios-context-menu-item">
          <span class="ios-context-menu-item-icon">${icon(MapPin, 17)}</span>
          Pin
        </div>
        <div class="ios-context-menu-item ios-context-menu-item-disabled">
          <span class="ios-context-menu-item-icon">${icon(Eye, 17)}</span>
          Mute (unavailable)
        </div>
        <div class="ios-context-menu-separator"></div>
        <div class="ios-context-menu-item ios-context-menu-item-destructive">
          <span class="ios-context-menu-item-icon">${icon(Trash2, 17)}</span>
          Delete
        </div>
      </div>
    </div>
  `,
};
