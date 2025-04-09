import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

type MoodType = {
  emoji: string;
  label: string;
};

type MoodEntry = {
  emoji: string;
  label: string;
  hour: number;
  timeCategory: string;
  date: string;
};

const moods: MoodType[] = [
  { emoji: '😄', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😍', label: 'Loved' },
  { emoji: '😐', label: 'Neutral' },
];

const getTimeCategory = (hour: number) => {
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
};

const MoodScreen = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleMoodPress = async (mood: MoodType) => {
    const hour = selectedDate.getHours();
    const date = selectedDate.toISOString().split('T')[0];
    const timeCategory = getTimeCategory(hour);

    const moodEntry: MoodEntry = {
      emoji: mood.emoji,
      label: mood.label,
      hour,
      timeCategory,
      date,
    };

    try {
      const existingData = await AsyncStorage.getItem('moodData');
      const parsedData = existingData ? JSON.parse(existingData) : {};
      if (!parsedData[date]) parsedData[date] = [];
      parsedData[date].push(moodEntry);

      await AsyncStorage.setItem('moodData', JSON.stringify(parsedData));
      Alert.alert('Saved!', `Mood: ${mood.label} (${timeCategory})`);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) setSelectedDate(date);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>How are you feeling right now?</Text>

      <TouchableOpacity style={styles.selectTimeBtn} onPress={() => setShowPicker(true)}>
        <Ionicons name="time-outline" size={20} color="#fff" />
        <Text style={styles.selectTimeText}>Select Time</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <FlatList
        data={moods}
        keyExtractor={(item) => item.label}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.moodCard}
            onPress={() => handleMoodPress(item)}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.viewHistoryBtn}
        onPress={() => router.push('/MoodHistoryScreen')}
      >
        <Ionicons name="bar-chart-outline" size={20} color="#fff" />
        <Text style={styles.historyText}>View Mood History</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MoodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fdfdfd',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#1f2937',
  },
  moodCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    margin: 10,
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  emoji: {
    fontSize: 40,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
  },
  selectTimeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  viewHistoryBtn: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  historyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
