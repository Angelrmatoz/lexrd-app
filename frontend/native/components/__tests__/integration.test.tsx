import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

// Componente de prueba que integra lógica de validación (errores)
const TestForm = ({ onSubmit }: { onSubmit: (val: string) => void }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handlePress = () => {
    if (text.trim() === '') {
      setError('El campo no puede estar vacío');
      return;
    }
    setError('');
    onSubmit(text);
  };

  return (
    <Card>
      <Input
        placeholder="Escribe aquí"
        value={text}
        onChangeText={(val) => {
          setText(val);
          if (val) setError('');
        }}
      />
      {error !== '' && <Text testID="error-message">{error}</Text>}
      <Button
        label="Enviar"
        onPress={handlePress}
      />
    </Card>
  );
};

describe('Integración de Componentes - Manejo de Errores', () => {
  it('escribe en Input dentro de Card y envía con Button (Happy Path)', () => {
    const onSubmitMock = jest.fn();
    const { getByPlaceholderText, getByText, queryByTestId } = render(
      <TestForm onSubmit={onSubmitMock} />
    );

    const input = getByPlaceholderText('Escribe aquí');
    const button = getByText('Enviar');

    fireEvent.changeText(input, 'Texto de prueba');
    fireEvent.press(button);

    expect(onSubmitMock).toHaveBeenCalledWith('Texto de prueba');
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(queryByTestId('error-message')).toBeNull();
  });

  it('muestra mensaje de error si se intenta enviar vacío y previene onSubmit', () => {
    const onSubmitMock = jest.fn();
    const { getByText, getByTestId } = render(
      <TestForm onSubmit={onSubmitMock} />
    );

    const button = getByText('Enviar');
    
    // Simula envío sin texto
    fireEvent.press(button);

    expect(onSubmitMock).not.toHaveBeenCalled();
    expect(getByTestId('error-message').props.children).toBe('El campo no puede estar vacío');
  });

  it('limpia el mensaje de error al escribir nuevo texto', () => {
    const onSubmitMock = jest.fn();
    const { getByPlaceholderText, getByText, getByTestId, queryByTestId } = render(
      <TestForm onSubmit={onSubmitMock} />
    );

    const input = getByPlaceholderText('Escribe aquí');
    const button = getByText('Enviar');

    // Genera error
    fireEvent.press(button);
    expect(getByTestId('error-message')).toBeTruthy();

    // Corrige error
    fireEvent.changeText(input, 'Nuevo texto');
    expect(queryByTestId('error-message')).toBeNull();
    
    // Envía con éxito
    fireEvent.press(button);
    expect(onSubmitMock).toHaveBeenCalledWith('Nuevo texto');
  });
});
