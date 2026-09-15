import { Redirect, Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tokens } from '@rotatrucks/back/tokens'
import { Icon, type IconName } from '@/components/Icon'
import { useAuth } from '@/contexts/AuthContext'

const TAB_CONTENT_HEIGHT = 52

export default function TabsLayout() {
  const auth = useAuth()
  const insets = useSafeAreaInsets()
  const bottomInset = Math.max(insets.bottom, 8)
  const tabBarHeight = TAB_CONTENT_HEIGHT + bottomInset

  if (auth.status === 'anonymous') {
    return <Redirect href="/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.color.brand,
        tabBarInactiveTintColor: tokens.color.muted,
        sceneStyle: {
          backgroundColor: tokens.color.fog,
        },
        tabBarStyle: {
          backgroundColor: tokens.color.surface,
          borderTopColor: tokens.color.line,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontFamily: tokens.font.label,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="comunidade"
        options={{
          title: 'Comunidade',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
          tabBarBadge: auth.truckPending ? '!' : undefined,
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

function TabIcon({ name, color }: { name: IconName; color: string | { toString(): string } }) {
  return <Icon name={name} size={24} color={String(color)} />
}
