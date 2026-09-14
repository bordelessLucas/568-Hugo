import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'

interface InputProps {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  error?: string
  secure?: boolean
  icon?: 'mail' | 'lock' | 'user'
  keyboard?: 'email' | 'default'
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
        {icon ? <Text style={styles.icon}>{iconMark(icon)}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={tokens.color.muted}
          secureTextEntry={secure && !visible}
          keyboardType={keyboard === 'email' ? 'email-address' : 'default'}
          autoCapitalize={keyboard === 'email' ? 'none' : 'words'}
          autoCorrect={false}
          style={styles.input}
        />
        {secure ? (
          <Pressable onPress={() => setVisible((current) => !current)}>
            <Text style={styles.toggle}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

function iconMark(icon: 'mail' | 'lock' | 'user'): string {
  if (icon === 'mail') return '@'
  if (icon === 'lock') return '•'
  return '·'
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
  icon: {
    color: tokens.color.muted,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
  },
  input: {
    flex: 1,
    height: '100%',
    color: tokens.color.ink,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.body,
  },
  toggle: {
    color: tokens.color.muted,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  error: {
    color: tokens.color.danger,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
})
