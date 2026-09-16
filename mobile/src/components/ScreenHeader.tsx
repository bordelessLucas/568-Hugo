import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Icon, type IconName } from '@/components/Icon'
import { pressStyle } from '@/lib/press'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  icon?: IconName
  back?: boolean
}

export function ScreenHeader({ title, subtitle, icon, back }: ScreenHeaderProps) {
  const router = useRouter()
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {back ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={8}
            style={pressStyle(styles.back, { opacity: 0.75 })}
          >
            <Icon name="chevron-back" size={24} color={tokens.color.ink} />
          </Pressable>
        ) : null}
        {icon ? (
          <View style={styles.icon}>
            <Icon name={icon} size={22} color={tokens.color.brand} />
          </View>
        ) : null}
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: tokens.space[5],
    paddingBottom: tokens.space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.line,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.line,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: tokens.font.sign,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.color.ink,
  },
  subtitle: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
})
