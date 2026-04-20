import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(<Button label="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Press" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Press'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button label="Disabled" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('applies custom testID', () => {
    const { getByTestId } = render(<Button label="Test" testID="custom-btn" />);
    expect(getByTestId('custom-btn')).toBeTruthy();
  });
});
