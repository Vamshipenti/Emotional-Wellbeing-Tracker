import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetMoodData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('Mood data reset successfully.');
  } catch (error) {
    console.error('Error clearing mood data:', error);
  }
};
