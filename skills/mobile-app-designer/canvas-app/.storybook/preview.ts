import type { Preview } from '@storybook/html-vite'
import '../src/ios-design-system/styles.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
  decorators: [
    (story) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ios-screen';
      wrapper.style.cssText = 'min-height: auto; width: 393px; padding: 16px; background: white;';
      const content = story();
      if (typeof content === 'string') {
        wrapper.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        wrapper.appendChild(content);
      }
      return wrapper;
    }
  ],
};

export default preview;
