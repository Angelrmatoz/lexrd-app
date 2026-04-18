import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Card } from '../Card';
import { Input } from '../Input';
import { Button } from '../Button';

// Componente simple que integra los 3 componentes
const TestForm = ({ onSubmit }: { onSubmit: (val: string) => void }) => {
  const [text, setText] = useState('');

  return (
    <Card>
      <Input
        placeholder="Escribe aquí"
        value={text}
        onChangeText={setText}
      />
      <Button
        label="Enviar"
        onPress={() => onSubmit(text)}
      />
    </Card>
  );
};

describe('Integración de Componentes', () => {
  it('escribe en Input dentro de Card y envía con Button', () => {
    const onSubmitMock = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <TestForm onSubmit={onSubmitMock} />
    );

    const input = getByPlaceholderText('Escribe aquí');
    const button = getByText('Enviar');

    fireEvent.changeText(input, 'Texto de prueba');
    fireEvent.press(button);

    expect(onSubmitMock).toHaveBeenCalledWith('Texto de prueba');
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });
});
