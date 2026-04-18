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
});
