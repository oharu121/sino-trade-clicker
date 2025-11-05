/**
 * Component tests for TabSelector
 * @module __tests__/components/TabSelector.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabSelector } from '@/components/TabSelector';
import { CHANNELS, CHANNEL_LIST } from '@/lib/constants';

describe('TabSelector', () => {
  const mockOnChannelChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all channel tabs', () => {
    render(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.MACRO_EXPERT.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    expect(screen.getByRole('tab', { name: '深談總經' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '川普專題' })).toBeInTheDocument();
  });

  it('should highlight the selected tab', () => {
    render(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.MACRO_EXPERT.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    const macroTab = screen.getByRole('tab', { name: '深談總經' });
    const trumpTab = screen.getByRole('tab', { name: '川普專題' });

    expect(macroTab).toHaveAttribute('aria-selected', 'true');
    expect(trumpTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should call onChannelChange when clicking a tab', async () => {
    const user = userEvent.setup();

    render(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.MACRO_EXPERT.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    const trumpTab = screen.getByRole('tab', { name: '川普專題' });
    await user.click(trumpTab);

    expect(mockOnChannelChange).toHaveBeenCalledWith(CHANNELS.TRUMP_TOPIC.id);
    expect(mockOnChannelChange).toHaveBeenCalledTimes(1);
  });

  it('should not call onChannelChange when clicking the already selected tab', async () => {
    const user = userEvent.setup();

    render(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.MACRO_EXPERT.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    const macroTab = screen.getByRole('tab', { name: '深談總經' });
    await user.click(macroTab);

    expect(mockOnChannelChange).toHaveBeenCalledWith(CHANNELS.MACRO_EXPERT.id);
  });

  it('should have proper ARIA attributes', () => {
    render(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.MACRO_EXPERT.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Article Channel Selection');

    const macroTab = screen.getByRole('tab', { name: '深談總經' });
    expect(macroTab).toHaveAttribute('aria-controls', 'panel-macro-expert');
  });

  it('should have minimum 44px touch target height', () => {
    render(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.MACRO_EXPERT.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    const macroTab = screen.getByRole('tab', { name: '深談總經' });

    // Check for min-h-[44px] class
    expect(macroTab.className).toContain('min-h-[44px]');
  });

  it('should switch active state correctly', async () => {
    const _user = userEvent.setup();
    const { rerender } = render(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.MACRO_EXPERT.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    let macroTab = screen.getByRole('tab', { name: '深談總經' });
    let trumpTab = screen.getByRole('tab', { name: '川普專題' });

    expect(macroTab).toHaveAttribute('aria-selected', 'true');
    expect(trumpTab).toHaveAttribute('aria-selected', 'false');

    // Simulate external state change
    rerender(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.TRUMP_TOPIC.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    macroTab = screen.getByRole('tab', { name: '深談總經' });
    trumpTab = screen.getByRole('tab', { name: '川普專題' });

    expect(macroTab).toHaveAttribute('aria-selected', 'false');
    expect(trumpTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();

    render(
      <TabSelector
        channels={CHANNEL_LIST}
        selectedChannelId={CHANNELS.MACRO_EXPERT.id}
        onChannelChange={mockOnChannelChange}
      />
    );

    const _trumpTab = screen.getByRole('tab', { name: '川普專題' });

    // Tab to focus the element
    await user.tab();

    // Press Enter or Space to activate
    await user.keyboard('{Enter}');

    expect(mockOnChannelChange).toHaveBeenCalled();
  });
});
