import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { tokens } from '@rotatrucks/back/tokens'

interface ContainerProps {
  children: ReactNode
  scroll?: boolean
}

export function Container({ children, scroll = true }: ContainerProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scroll}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.plain}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.color.fog,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: tokens.space[5],
    paddingBottom: tokens.space[5],
  },
  plain: {
    flex: 1,
    paddingHorizontal: tokens.space[5],
    paddingBottom: tokens.space[4],
  },
})
