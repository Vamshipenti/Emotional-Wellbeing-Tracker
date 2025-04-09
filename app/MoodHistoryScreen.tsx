import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, Button, Alert } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetMoodData } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const moodEmojis: { [key: string]: string } = {
  Happy: '😊',
  Sad: '😢',
  Tired: '😴',
  Angry: '😡',
  Neutral: '😐',
  Loved: '❤️',
};



const MoodHistoryScreen = () => {
  const [moodStats, setMoodStats] = useState<{ [key: string]: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchMoodData();
    }, [])
  );

  const fetchMoodData = async () => {
    try {
      const rawData = await AsyncStorage.getItem('moodData');
      const parsedData = rawData ? JSON.parse(rawData) : {};
      const moodCount: { [key: string]: number } = {};

      Object.values(parsedData).forEach((day: any) => {
        day.forEach((entry: any) => {
          if (moodCount[entry.label]) {
            moodCount[entry.label]++;
          } else {
            moodCount[entry.label] = 1;
          }
        });
      });

      setMoodStats(moodCount);
    } catch (error) {
      console.error('Error fetching mood data:', error);
      setMoodStats({});
    }
  };

  const chartColors = ['#facc15', '#60a5fa', '#f87171', '#34d399', '#c084fc', '#fb923c'];
  const chartData =
  moodStats && Object.keys(moodStats).length > 0
    ? Object.entries(moodStats).map(([moodKey, count], index) => {
        const emoji = moodEmojis[moodKey as keyof typeof moodEmojis] ?? '';
        return {
          name: `${emoji} ${moodKey}`,
          population: count,
          color: chartColors[index % chartColors.length],
          legendFontColor: '#333',
          legendFontSize: 14,
        };
      })
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood History Overview</Text>

      {chartData.length > 0 ? (
        <PieChart
          data={chartData}
          width={screenWidth - 20}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={{ textAlign: 'center', marginVertical: 20 }}>No mood data yet</Text>
      )}

      {chartData.length > 0 && <Text style={styles.subTitle}>Breakdown</Text>}

      <FlatList
        data={chartData}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Text style={{ color: item.color, fontSize: 16, marginVertical: 4 }}>
            {item.name}: {item.population} times
          </Text>
        )}
      />

      <Button
        title="Reset Mood History"
        onPress={() =>
          Alert.alert('Confirm Reset', 'Are you sure you want to clear all mood data?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: async () => {
                await resetMoodData();
                setMoodStats({});
              },
            },
          ])
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subTitle: { fontSize: 18, fontWeight: '600', marginTop: 20 },
});

export default MoodHistoryScreen;
