import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Icon, type IconName } from '@/components/Icon'

interface InputProps {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  error?: string
  secure?: boolean
  icon?: 'mail' | 'lock' | 'user' | 'locate' | 'business' | 'document'
  keyboard?: 'email' | 'default' | 'decimal'
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  icon,
  keyboard = 'default',
}: InputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {icon ? <Icon name={iconName(icon)} size={18} color={tokens.color.muted} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.color.muted}
          secureTextEntry={secure && !visible}
          keyboardType={
            keyboard === 'email' ? 'email-address' : keyboard === 'decimal' ? 'decimal-pad' : 'default'
          }
          autoCapitalize={keyboard === 'email' ? 'none' : keyboard === 'decimal' ? 'none' : 'words'}
          autoCorrect={false}
          style={styles.input}
        />
        {secure ? (
          <Pressable
            onPress={() => setVisible((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icon
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={tokens.color.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

function iconName(icon: NonNullable<InputProps['icon']>): IconName {
  if (icon === 'mail') return 'mail-outline'
  if (icon === 'lock') return 'lock-closed-outline'
  if (icon === 'locate') return 'locate-outline'
  if (icon === 'business') return 'business-outline'
  if (icon === 'document') return 'document-text-outline'
  return 'person-outline'
}

const styles = StyleSheet.create({
  wrap: {
    gap: tokens.space[2],
  },
  label: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.label,
    color: tokens.color.ink,
  },
  field: {
    height: tokens.size.control,
    borderRadius: tokens.radius.field,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    paddingHorizontal: tokens.space[3],
  },
  fieldError: {
    borderColor: tokens.color.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    color: tokens.color.ink,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.body,
  },
  error: {
    color: tokens.color.danger,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
})
