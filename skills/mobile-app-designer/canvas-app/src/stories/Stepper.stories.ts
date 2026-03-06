import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Stepper',
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => `
    <div class="ios-stepper">
      <div class="ios-stepper-btn">&minus;</div>
      <div class="ios-stepper-separator"></div>
      <div class="ios-stepper-btn">+</div>
    </div>
  `,
};

export const InListCell: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="margin:-16px;padding-top:0;">
      <div class="ios-list-group">
        <div class="ios-list-cell">
          <span class="ios-body" style="flex:1">Quantity</span>
          <div class="ios-stepper">
            <div class="ios-stepper-btn">&minus;</div>
            <div class="ios-stepper-separator"></div>
            <div class="ios-stepper-btn">+</div>
          </div>
        </div>
        <div class="ios-list-cell">
          <span class="ios-body" style="flex:1">Guests</span>
          <div class="ios-stepper">
            <div class="ios-stepper-btn">&minus;</div>
            <div class="ios-stepper-separator"></div>
            <div class="ios-stepper-btn">+</div>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const WithValue: Story = {
  render: () => `
    <div style="display:flex;align-items:center;gap:12px;">
      <div class="ios-stepper">
        <div class="ios-stepper-btn">&minus;</div>
        <div class="ios-stepper-separator"></div>
        <div class="ios-stepper-btn">+</div>
      </div>
      <span class="ios-body" style="min-width:24px;text-align:center;">3</span>
    </div>
  `,
};
