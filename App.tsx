import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from './src/screens/HomeScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { useStandupStore } from './src/store/standupStore';
import { colors, radius } from './src/utils/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const loadLogs = useStandupStore(s => s.loadLogs);

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' as const },
            medium: { fontFamily: 'System', fontWeight: '500' as const },
            bold: { fontFamily: 'System', fontWeight: '700' as const },
            heavy: { fontFamily: 'System', fontWeight: '900' as const },
          },
          colors: {
            primary: colors.primary,
            background: colors.bg,
            card: colors.bgCard,
            text: colors.textPrimary,
            border: colors.border,
            notification: colors.primary,
          },
        }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.bgCard,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingBottom: Platform.OS === 'ios' ? 4 : 8,
              paddingTop: 8,
              height: Platform.OS === 'ios' ? 80 : 64,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600' as const,
              letterSpacing: 0.3,
            },
            tabBarIcon: ({ focused, color }) => {
              const icons: Record<string, [string, string]> = {
                Log: ['flash', 'flash-outline'],
                History: ['layers', 'layers-outline'],
                Profile: ['person-circle', 'person-circle-outline'],
              };
              const [active, inactive] = icons[route.name] || ['help', 'help-outline'];
              return (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 28,
                  borderRadius: radius.sm,
                  backgroundColor: focused ? colors.primaryMuted : 'transparent',
                }}>
                  <Ionicons name={(focused ? active : inactive) as any} size={20} color={color} />
                </View>
              );
            },
          })}
        >
          <Tab.Screen name="Log" component={HomeScreen} options={{ tabBarLabel: 'Log' }} />
          <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
