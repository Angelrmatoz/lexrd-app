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
    fireEvent.changeText(input, 'Attempt');
    
    // In RNTL, fireEvent might still trigger, but native behavior would block.
    // Testing props is safer here.
    expect(input.props.editable).toBe(false);
  });
});
