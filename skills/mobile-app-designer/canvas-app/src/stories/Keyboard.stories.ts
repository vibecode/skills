import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Keyboard',
};
export default meta;

type Story = StoryObj;

export const AlphabeticKeyboard: Story = {
  render: () => `
    <div class="ios-keyboard" style="max-width:393px;">
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key">Q</div>
        <div class="ios-keyboard-key">W</div>
        <div class="ios-keyboard-key">E</div>
        <div class="ios-keyboard-key">R</div>
        <div class="ios-keyboard-key">T</div>
        <div class="ios-keyboard-key">Y</div>
        <div class="ios-keyboard-key">U</div>
        <div class="ios-keyboard-key">I</div>
        <div class="ios-keyboard-key">O</div>
        <div class="ios-keyboard-key">P</div>
      </div>
      <div class="ios-keyboard-row" style="padding:0 18px;">
        <div class="ios-keyboard-key">A</div>
        <div class="ios-keyboard-key">S</div>
        <div class="ios-keyboard-key">D</div>
        <div class="ios-keyboard-key">F</div>
        <div class="ios-keyboard-key">G</div>
        <div class="ios-keyboard-key">H</div>
        <div class="ios-keyboard-key">J</div>
        <div class="ios-keyboard-key">K</div>
        <div class="ios-keyboard-key">L</div>
      </div>
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key-action">&#x21E7;</div>
        <div class="ios-keyboard-key">Z</div>
        <div class="ios-keyboard-key">X</div>
        <div class="ios-keyboard-key">C</div>
        <div class="ios-keyboard-key">V</div>
        <div class="ios-keyboard-key">B</div>
        <div class="ios-keyboard-key">N</div>
        <div class="ios-keyboard-key">M</div>
        <div class="ios-keyboard-key-action">&#x232B;</div>
      </div>
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key-wide">123</div>
        <div class="ios-keyboard-key-wide">&#x1F310;</div>
        <div class="ios-keyboard-key-space">space</div>
        <div class="ios-keyboard-key-return">return</div>
      </div>
    </div>
  `,
};

export const NumericKeyboard: Story = {
  render: () => `
    <div class="ios-keyboard ios-keyboard-numeric" style="max-width:393px;">
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key">1</div>
        <div class="ios-keyboard-key">2</div>
        <div class="ios-keyboard-key">3</div>
      </div>
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key">4</div>
        <div class="ios-keyboard-key">5</div>
        <div class="ios-keyboard-key">6</div>
      </div>
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key">7</div>
        <div class="ios-keyboard-key">8</div>
        <div class="ios-keyboard-key">9</div>
      </div>
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key"></div>
        <div class="ios-keyboard-key">0</div>
        <div class="ios-keyboard-key">&#x232B;</div>
      </div>
    </div>
  `,
};

export const WithSuggestions: Story = {
  render: () => `
    <div class="ios-keyboard" style="max-width:393px;">
      <div class="ios-keyboard-suggestions">
        <span>the</span>
        <span>I</span>
        <span>to</span>
      </div>
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key">Q</div>
        <div class="ios-keyboard-key">W</div>
        <div class="ios-keyboard-key">E</div>
        <div class="ios-keyboard-key">R</div>
        <div class="ios-keyboard-key">T</div>
        <div class="ios-keyboard-key">Y</div>
        <div class="ios-keyboard-key">U</div>
        <div class="ios-keyboard-key">I</div>
        <div class="ios-keyboard-key">O</div>
        <div class="ios-keyboard-key">P</div>
      </div>
      <div class="ios-keyboard-row" style="padding:0 18px;">
        <div class="ios-keyboard-key">A</div>
        <div class="ios-keyboard-key">S</div>
        <div class="ios-keyboard-key">D</div>
        <div class="ios-keyboard-key">F</div>
        <div class="ios-keyboard-key">G</div>
        <div class="ios-keyboard-key">H</div>
        <div class="ios-keyboard-key">J</div>
        <div class="ios-keyboard-key">K</div>
        <div class="ios-keyboard-key">L</div>
      </div>
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key-action">&#x21E7;</div>
        <div class="ios-keyboard-key">Z</div>
        <div class="ios-keyboard-key">X</div>
        <div class="ios-keyboard-key">C</div>
        <div class="ios-keyboard-key">V</div>
        <div class="ios-keyboard-key">B</div>
        <div class="ios-keyboard-key">N</div>
        <div class="ios-keyboard-key">M</div>
        <div class="ios-keyboard-key-action">&#x232B;</div>
      </div>
      <div class="ios-keyboard-row">
        <div class="ios-keyboard-key-wide">123</div>
        <div class="ios-keyboard-key-wide">&#x1F310;</div>
        <div class="ios-keyboard-key-space">space</div>
        <div class="ios-keyboard-key-return">return</div>
      </div>
    </div>
  `,
};
