import type { Meta, StoryObj } from '@storybook/html-vite';

const meta: Meta = {
  title: 'iOS Design System/Picker',
};
export default meta;

type Story = StoryObj;

export const WheelPicker: Story = {
  render: () => `
    <div class="ios-picker">
      <div class="ios-picker-wheel">
        <div class="ios-picker-item">8</div>
        <div class="ios-picker-item">9</div>
        <div class="ios-picker-item ios-picker-selected">10</div>
        <div class="ios-picker-item">11</div>
        <div class="ios-picker-item">12</div>
      </div>
      <div class="ios-picker-wheel">
        <div class="ios-picker-item">13</div>
        <div class="ios-picker-item">14</div>
        <div class="ios-picker-item ios-picker-selected">15</div>
        <div class="ios-picker-item">16</div>
        <div class="ios-picker-item">17</div>
      </div>
      <div class="ios-picker-wheel">
        <div class="ios-picker-item">AM</div>
        <div class="ios-picker-item ios-picker-selected">PM</div>
        <div class="ios-picker-item">AM</div>
        <div class="ios-picker-item">PM</div>
        <div class="ios-picker-item">AM</div>
      </div>
    </div>
  `,
};

export const DatePicker: Story = {
  render: () => `
    <div>
      <div class="ios-calendar">
        <div class="ios-calendar-header">
          <span class="ios-blue" style="font-size:20px;">‹</span>
          <span>March 2026</span>
          <span class="ios-blue" style="font-size:20px;">›</span>
        </div>
        <div class="ios-calendar-weekdays">
          <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
        </div>
        <div class="ios-calendar-grid">
          <div class="ios-calendar-day ios-calendar-day-outside">23</div>
          <div class="ios-calendar-day ios-calendar-day-outside">24</div>
          <div class="ios-calendar-day ios-calendar-day-outside">25</div>
          <div class="ios-calendar-day ios-calendar-day-outside">26</div>
          <div class="ios-calendar-day ios-calendar-day-outside">27</div>
          <div class="ios-calendar-day ios-calendar-day-outside">28</div>
          <div class="ios-calendar-day">1</div>
          <div class="ios-calendar-day">2</div>
          <div class="ios-calendar-day">3</div>
          <div class="ios-calendar-day ios-calendar-day-today">4</div>
          <div class="ios-calendar-day">5</div>
          <div class="ios-calendar-day">6</div>
          <div class="ios-calendar-day">7</div>
          <div class="ios-calendar-day">8</div>
          <div class="ios-calendar-day">9</div>
          <div class="ios-calendar-day">10</div>
          <div class="ios-calendar-day">11</div>
          <div class="ios-calendar-day">12</div>
          <div class="ios-calendar-day">13</div>
          <div class="ios-calendar-day">14</div>
          <div class="ios-calendar-day ios-calendar-day-selected">15</div>
          <div class="ios-calendar-day">16</div>
          <div class="ios-calendar-day">17</div>
          <div class="ios-calendar-day">18</div>
          <div class="ios-calendar-day">19</div>
          <div class="ios-calendar-day">20</div>
          <div class="ios-calendar-day">21</div>
          <div class="ios-calendar-day">22</div>
          <div class="ios-calendar-day">23</div>
          <div class="ios-calendar-day">24</div>
          <div class="ios-calendar-day">25</div>
          <div class="ios-calendar-day">26</div>
          <div class="ios-calendar-day">27</div>
          <div class="ios-calendar-day">28</div>
          <div class="ios-calendar-day">29</div>
          <div class="ios-calendar-day">30</div>
          <div class="ios-calendar-day">31</div>
          <div class="ios-calendar-day ios-calendar-day-outside">1</div>
          <div class="ios-calendar-day ios-calendar-day-outside">2</div>
          <div class="ios-calendar-day ios-calendar-day-outside">3</div>
          <div class="ios-calendar-day ios-calendar-day-outside">4</div>
        </div>
      </div>
    </div>
  `,
};

export const CompactDatePicker: Story = {
  render: () => `
    <div class="ios-list ios-list-inset" style="padding-bottom:24px;">
      <div class="ios-list-group">
        <div class="ios-list-cell" style="min-height:52px;">
          <div class="ios-list-cell-detail" style="align-items:center;">
            <span>Starts</span>
            <div style="display:flex;gap:8px;">
              <span class="ios-date-pill ios-date-pill-active">Mar 15, 2026</span>
              <span class="ios-date-pill">10:00 AM</span>
            </div>
          </div>
        </div>
        <div class="ios-list-cell" style="min-height:52px;">
          <div class="ios-list-cell-detail" style="align-items:center;">
            <span>Ends</span>
            <div style="display:flex;gap:8px;">
              <span class="ios-date-pill">Mar 15, 2026</span>
              <span class="ios-date-pill">11:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
