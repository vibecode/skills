import type { Meta, StoryObj } from '@storybook/html-vite';
import { icon, MessageCircle, Mail, Copy, Link } from './icons';

const meta: Meta = {
  title: 'iOS Design System/Sheet',
  decorators: [
    (story) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ios-screen';
      wrapper.style.cssText = 'min-height:auto;width:393px;padding:0;background:var(--ios-bg-secondary);position:relative;';
      const content = story();
      if (typeof content === 'string') wrapper.innerHTML = content;
      else if (content instanceof HTMLElement) wrapper.appendChild(content);
      return wrapper;
    }
  ],
};
export default meta;

type Story = StoryObj;

export const FullScreen: Story = {
  render: () => `
    <div style="position:relative;height:500px;">
      <div class="ios-sheet">
        <div class="ios-sheet-toolbar">
          <div class="ios-sheet-handle"></div>
          <div class="ios-sheet-toolbar-controls">
            <span class="ios-btn-plain ios-label-secondary">Cancel</span>
            <span class="ios-sheet-toolbar-title">Share</span>
            <span class="ios-btn-plain ios-blue" style="font-weight:600;">Done</span>
          </div>
        </div>
        <div style="padding:0 16px 16px;">
          <div style="display:flex;justify-content:space-around;margin-top:8px;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="width:48px;height:48px;border-radius:12px;background:var(--ios-blue);display:flex;align-items:center;justify-content:center;">${icon(MessageCircle, 24, 'white')}</div>
              <span class="ios-caption">Messages</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="width:48px;height:48px;border-radius:12px;background:var(--ios-green);display:flex;align-items:center;justify-content:center;">${icon(Mail, 24, 'white')}</div>
              <span class="ios-caption">Mail</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="width:48px;height:48px;border-radius:12px;background:var(--ios-orange);display:flex;align-items:center;justify-content:center;">${icon(Copy, 24, 'white')}</div>
              <span class="ios-caption">Copy</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="width:48px;height:48px;border-radius:12px;background:var(--ios-purple);display:flex;align-items:center;justify-content:center;">${icon(Link, 24, 'white')}</div>
              <span class="ios-caption">Link</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const Inspector: Story = {
  render: () => `
    <div style="position:relative;height:460px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;">
      <div class="ios-sheet-inspector" style="height:380px;">
        <div class="ios-sheet-toolbar">
          <div class="ios-sheet-handle"></div>
          <div class="ios-sheet-toolbar-controls">
            <span class="ios-btn-plain ios-label-secondary">Cancel</span>
            <span class="ios-sheet-toolbar-title">Title</span>
            <span class="ios-btn-plain ios-blue" style="font-weight:600;">Done</span>
          </div>
        </div>
        <div style="padding:0 16px 16px;">
          <p class="ios-body ios-label-secondary" style="margin-top:8px;">Inspector sheet with glass material, visible over colorful backgrounds.</p>
        </div>
      </div>
    </div>
  `,
};

export const Stacked: Story = {
  render: () => `
    <div style="position:relative;height:500px;overflow:hidden;border-radius:12px;">
      <div style="position:absolute;inset:0 16px;background:var(--ios-bg);border-radius:38px 38px 0 0;overflow:clip;">
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.1);"></div>
      </div>
      <div class="ios-sheet" style="top:10px;bottom:0;">
        <div class="ios-sheet-toolbar">
          <div class="ios-sheet-handle"></div>
          <div class="ios-sheet-toolbar-controls">
            <span class="ios-btn-plain ios-label-secondary">Cancel</span>
            <span class="ios-sheet-toolbar-title">New Event</span>
            <span class="ios-btn-plain ios-blue" style="font-weight:600;">Add</span>
          </div>
        </div>
        <div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:12px;">
          <input class="ios-text-field" placeholder="Event name" />
          <input class="ios-text-field" placeholder="Location" />
        </div>
      </div>
    </div>
  `,
};

export const WithHandle: Story = {
  render: () => `
    <div style="position:relative;height:200px;">
      <div class="ios-sheet">
        <div class="ios-sheet-toolbar">
          <div class="ios-sheet-handle"></div>
        </div>
        <div style="padding:0 16px 16px;">
          <p class="ios-title-3">Details</p>
          <p class="ios-body ios-label-secondary" style="margin-top:8px;">Additional information goes here.</p>
        </div>
      </div>
    </div>
  `,
};
