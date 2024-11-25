import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface DateTimePickerProps {
  value: Date;
  mode?: 'date' | 'time';
  display?: string;
  onChange?: (event: any, date?: Date) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, mode = 'date', onChange }) => {
  const handleChange = (e: any) => {
    const newDate = new Date(e.target.value);
    onChange?.({ type: 'set' }, newDate);
  };

  const formatValue = () => {
    if (mode === 'time') {
      return value.toLocaleTimeString('en-US', { hour12: false });
    }
    return value.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        type={mode === 'time' ? 'time' : 'date'}
        value={formatValue()}
        onChange={handleChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});

export default DateTimePicker;
