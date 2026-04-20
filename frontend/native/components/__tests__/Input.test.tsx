import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '@/components/Input';

describe('Input', () => {
  it('renders correctly and accepts input', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Type here" onChangeText={onChangeTextMock} />
    );
    
    const input = getByPlaceholderText('Type here');
    expect(input).toBeTruthy();

    fireEvent.changeText(input, 'Hello');
    expect(onChangeTextMock).toHaveBeenCalledWith('Hello');
  });

  it('renders with prefilled value', () => {
    const { getByDisplayValue } = render(
      <Input value="Initial Value" />
    );
    expect(getByDisplayValue('Initial Value')).toBeTruthy();
  });

  it('is not editable when editable prop is false', () => {
    const onChangeTextMock = jest.fn();
    const { getByDisplayValue } = render(
      <Input value="ReadOnly" editable={false} onChangeText={onChangeTextMock} />
    );
    
    const input = getByDisplayValue('ReadOnly');
    
    // Testing props directly is safer for editable check
    expect(input.props.editable).toBe(false);
  });

  it('respects maxLength prop', () => {
    const { getByTestId } = render(
      <Input testID="length-input" maxLength={5} />
    );
    
    const input = getByTestId('length-input');
    expect(input.props.maxLength).toBe(5);
  });

  it('handles secureTextEntry for passwords', () => {
    const { getByTestId } = render(
      <Input testID="secure-input" secureTextEntry={true} />
    );
    
    const input = getByTestId('secure-input');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('clears input when value is updated to empty string', () => {
    const { getByDisplayValue, update } = render(
      <Input value="To be cleared" />
    );
    
    expect(getByDisplayValue('To be cleared')).toBeTruthy();

    update(<Input value="" placeholder="Empty now" />);
    // The previous text should be gone
    expect(() => getByDisplayValue('To be cleared')).toThrow();
  });
});
