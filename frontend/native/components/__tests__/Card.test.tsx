import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '@/components/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('renders with variant high correctly', () => {
    const { getByText } = render(
      <Card variant="high">
        <Text>High Variant</Text>
      </Card>
    );
    expect(getByText('High Variant')).toBeTruthy();
  });

  it('renders with custom testID', () => {
    const { getByTestId } = render(
      <Card testID="card-id">
        <Text>Test</Text>
      </Card>
    );
    expect(getByTestId('card-id')).toBeTruthy();
  });
});
