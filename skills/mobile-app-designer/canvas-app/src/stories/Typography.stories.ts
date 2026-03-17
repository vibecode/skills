import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Typography',
};
export default meta;

type Story = StoryObj;

export const LargeTitle: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-title-large">Large Title — 34px Bold</p></div>',
};

export const Title: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-title">Title — 28px Bold</p></div>',
};

export const Title2: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-title-2">Title 2 — 22px Bold</p></div>',
};

export const Title3: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-title-3">Title 3 — 20px Semibold</p></div>',
};

export const Headline: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-headline">Headline — 17px Semibold</p></div>',
};

export const Body: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-body">Body text for paragraphs and general content. This is the default text style used throughout iOS apps.</p></div>',
};

export const Callout: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-callout">Callout — 16px Regular</p></div>',
};

export const Subheadline: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-subheadline">Subheadline — 15px Regular</p></div>',
};

export const Footnote: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-footnote">Footnote — 13px Regular</p></div>',
};

export const Caption: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-caption">Caption — 12px Regular</p></div>',
};

export const Caption2: Story = {
  render: () => '<div class="ios-screen" style="padding:16px;"><p class="ios-caption-2">Caption 2 — 11px Regular</p></div>',
};

export const AllScales: Story = {
  render: () => `
    <div class="ios-screen" style="display:flex;flex-direction:column;gap:12px;padding:16px;">
      <p class="ios-title-large">Large Title</p>
      <p class="ios-title">Title</p>
      <p class="ios-title-2">Title 2</p>
      <p class="ios-title-3">Title 3</p>
      <p class="ios-headline">Headline</p>
      <p class="ios-body">Body</p>
      <p class="ios-callout">Callout</p>
      <p class="ios-subheadline">Subheadline</p>
      <p class="ios-footnote">Footnote</p>
      <p class="ios-caption">Caption</p>
      <p class="ios-caption-2">Caption 2</p>
    </div>
  `,
};
