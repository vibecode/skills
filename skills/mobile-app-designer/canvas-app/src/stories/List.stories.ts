import type { Meta, StoryObj } from '@storybook/html-vite';
import { icon, Plane, Wifi, Battery, Bell, Volume2, Moon, Smartphone, RefreshCw, Package, Lightbulb, LayoutGrid } from './icons';

const meta: Meta = {
  title: 'iOS Design System/List',
};
export default meta;

type Story = StoryObj;

export const SimpleCells: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="margin:-16px;padding-top:0;">
      <div class="ios-list-header">Simple Cells</div>
      <div class="ios-list-group">
        <div class="ios-list-cell">
          <span>Plain Cell</span>
        </div>
        <div class="ios-list-cell">
          <div class="ios-list-cell-detail">
            <span>Detail Disclosure</span>
          </div>
        </div>
        <div class="ios-list-cell">
          <div class="ios-list-cell-detail">
            <span>With Value</span>
            <span class="ios-list-cell-value">English</span>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="margin:-16px;padding-top:0;">
      <div class="ios-list-header">With Icons</div>
      <div class="ios-list-group">
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-blue">${icon(Plane, 16, 'white')}</div>
          <span style="flex:1">Airplane Mode</span>
          <div class="ios-toggle"></div>
        </div>
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-blue">${icon(Wifi, 16, 'white')}</div>
          <div class="ios-list-cell-detail">
            <span>Wi-Fi</span>
            <span class="ios-list-cell-value">Home</span>
          </div>
        </div>
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-green">${icon(Battery, 16, 'white')}</div>
          <div class="ios-list-cell-detail">
            <span>Battery</span>
            <span class="ios-list-cell-value">89%</span>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const TallCells: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="margin:-16px;padding-top:8px;">
      <div class="ios-list-group">
        <div class="ios-list-cell ios-list-cell-tall" style="flex-direction:column;align-items:flex-start;justify-content:center;">
          <span class="ios-headline">John Appleseed</span>
          <span class="ios-list-cell-subtitle">Apple ID, iCloud+, Media & Purchases</span>
        </div>
        <div class="ios-list-cell ios-list-cell-tall" style="flex-direction:column;align-items:flex-start;justify-content:center;">
          <span>Title</span>
          <span class="ios-list-cell-subtitle">Subtitle description text</span>
        </div>
      </div>
      <div class="ios-list-footer">Your Apple ID is used for all Apple services.</div>
    </div>
  `,
};

export const ProminentHeader: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="margin:-16px;padding-top:0;">
      <div class="ios-list-header-prominent">
        <span>Prominent Header</span>
        <span class="ios-list-header-action">Action</span>
      </div>
      <div class="ios-list-group">
        <div class="ios-list-cell">
          <div class="ios-list-cell-detail">
            <span>First Item</span>
          </div>
        </div>
        <div class="ios-list-cell">
          <div class="ios-list-cell-detail">
            <span>Second Item</span>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const ExtraProminentHeader: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="margin:-16px;padding-top:0;">
      <div class="ios-list-header-xl">
        <div>
          <div class="ios-list-header-supertitle">Supertitle</div>
          <div>Extra Prominent</div>
          <div class="ios-list-header-subtitle">Subtitle description</div>
        </div>
        <span class="ios-list-header-action">Action</span>
      </div>
      <div class="ios-list-group">
        <div class="ios-list-cell">
          <div class="ios-list-cell-detail">
            <span>First Item</span>
          </div>
        </div>
        <div class="ios-list-cell">
          <div class="ios-list-cell-detail">
            <span>Second Item</span>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const WithToggle: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="margin:-16px;padding-top:0;">
      <div class="ios-list-header">Preferences</div>
      <div class="ios-list-group">
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-blue">${icon(Bell, 16, 'white')}</div>
          <span style="flex:1">Notifications</span>
          <div class="ios-toggle ios-toggle-on"></div>
        </div>
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-green">${icon(Volume2, 16, 'white')}</div>
          <span style="flex:1">Sound</span>
          <div class="ios-toggle"></div>
        </div>
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-purple">${icon(Moon, 16, 'white')}</div>
          <span style="flex:1">Dark Mode</span>
          <div class="ios-toggle ios-toggle-on"></div>
        </div>
      </div>
    </div>
  `,
};

export const SettingsStyle: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="margin:-16px;padding-top:0;">
      <div class="ios-list-header">General</div>
      <div class="ios-list-group">
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-red">${icon(Smartphone, 16, 'white')}</div>
          <div class="ios-list-cell-detail">
            <span>About</span>
          </div>
        </div>
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-blue">${icon(RefreshCw, 16, 'white')}</div>
          <div class="ios-list-cell-detail">
            <span>Software Update</span>
          </div>
        </div>
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-green">${icon(Package, 16, 'white')}</div>
          <div class="ios-list-cell-detail">
            <span>Storage</span>
            <span class="ios-list-cell-value">54.3 GB</span>
          </div>
        </div>
      </div>
      <div class="ios-list-header">Display</div>
      <div class="ios-list-group">
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-blue">${icon(Lightbulb, 16, 'white')}</div>
          <div class="ios-list-cell-detail">
            <span>Display & Brightness</span>
          </div>
        </div>
        <div class="ios-list-cell ios-list-cell-has-icon">
          <div class="ios-list-cell-icon ios-bg-indigo">${icon(LayoutGrid, 16, 'white')}</div>
          <div class="ios-list-cell-detail">
            <span>Home Screen & App Library</span>
          </div>
        </div>
      </div>
    </div>
  `,
};
