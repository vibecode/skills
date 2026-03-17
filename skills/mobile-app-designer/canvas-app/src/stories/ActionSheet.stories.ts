import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Action Sheet',
};
export default meta;

type Story = StoryObj;

export const Standard: Story = {
  render: () => `
    <div class="ios-action-sheet" style="position:static;transform:none;">
      <div class="ios-action-sheet-title-group">
        <div class="ios-action-sheet-title">Select an option</div>
      </div>
      <div class="ios-action-sheet-group">
        <div class="ios-action-sheet-item">Save to Photos</div>
        <div class="ios-action-sheet-item">Copy Link</div>
        <div class="ios-action-sheet-item ios-action-sheet-item-destructive">Delete</div>
      </div>
    </div>
  `,
};

export const WithoutTitle: Story = {
  render: () => `
    <div class="ios-action-sheet" style="position:static;transform:none;">
      <div class="ios-action-sheet-group">
        <div class="ios-action-sheet-item ios-action-sheet-item-destructive">Delete</div>
        <div class="ios-action-sheet-item">Edit</div>
        <div class="ios-action-sheet-item">Duplicate</div>
      </div>
    </div>
  `,
};

export const WithMessage: Story = {
  render: () => `
    <div class="ios-action-sheet" style="position:static;transform:none;">
      <div class="ios-action-sheet-title-group">
        <div class="ios-action-sheet-title">A Short Title Is Best</div>
        <div class="ios-action-sheet-message">A description should be a short, complete sentence.</div>
      </div>
      <div class="ios-action-sheet-group">
        <div class="ios-action-sheet-item ios-action-sheet-item-destructive">Action 1</div>
        <div class="ios-action-sheet-item">Action 2</div>
        <div class="ios-action-sheet-item">Action 3</div>
      </div>
    </div>
  `,
};
