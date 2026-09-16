import {
  GENDERS,
  GENDER_LABELS,
  TRUCK_TYPES,
  TRUCK_TYPE_OPTIONS,
} from '@rotatrucks/back'
import { useEffect, useRef } from 'react'
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { Input } from '@/components/Input'
import { Body, Caption } from '@/components/Typography'
import { ONBOARDING_STEPS, useOnboardingForm } from '@/hooks/useOnboardingForm'
import { pressStyle } from '@/lib/press'

/** Full-screen wizard: one scroll surface (no sticky header/footer split). */
export function OnboardingModal() {
  const form = useOnboardingForm()
  const fade = useRef(new Animated.Value(0)).current
  const slide = useRef(new Animated.Value(16)).current

  useEffect(() => {
    fade.setValue(0.35)
    slide.setValue(8)
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start()
  }, [fade, form.step, slide])

  return (
    <Modal animationType="fade" visible presentationStyle="fullScreen">
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressRow}>
            <Caption>Configuração inicial</Caption>
            <Text style={styles.step}>
              Passo {form.stepIndex + 1} de {ONBOARDING_STEPS.length}
            </Text>
          </View>
          <View style={styles.dots}>
            {ONBOARDING_STEPS.map((step, index) => (
              <View
                key={step}
                style={[styles.dot, index <= form.stepIndex ? styles.dotActive : null]}
              />
            ))}
          </View>

          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            <View style={styles.heroIcon}>
              <Icon
                name={
                  form.step === 'gender'
                    ? 'person-outline'
                    : form.step === 'truck'
                      ? 'bus-outline'
                      : 'resize-outline'
                }
                size={34}
                color={tokens.color.brand}
              />
            </View>

            <Text style={styles.title}>{form.copy.title}</Text>
            <Body>{form.copy.body}</Body>

            {form.step === 'gender' ? (
              <View style={styles.choices}>
                {GENDERS.map((value) => (
                  <Choice
                    key={value}
                    icon="person-outline"
                    label={GENDER_LABELS[value]}
                    selected={form.gender === value}
                    onPress={() => form.setGender(value)}
                  />
                ))}
              </View>
            ) : null}

            {form.step === 'truck' ? (
              <View style={styles.choices}>
                {TRUCK_TYPES.map((value) => (
                  <Choice
                    key={value}
                    icon="bus-outline"
                    label={TRUCK_TYPE_OPTIONS[value].label}
                    hint={TRUCK_TYPE_OPTIONS[value].hint}
                    selected={form.truckType === value}
                    onPress={() => form.setTruckType(value)}
                  />
                ))}
              </View>
            ) : null}

            {form.step === 'measures' ? (
              <View style={styles.fields}>
                <Input label="Altura (m)" value={form.height} onChangeText={form.setHeight} placeholder="4,20" keyboard="decimal" />
                <Input label="Largura (m)" value={form.width} onChangeText={form.setWidth} placeholder="2,50" keyboard="decimal" />
                <Input
                  label="Comprimento (m)"
                  value={form.length}
                  onChangeText={form.setLength}
                  placeholder="14,00"
                  keyboard="decimal"
                />
                <Input
                  label="Peso total (t)"
                  value={form.weightTons}
                  onChangeText={form.setWeightTons}
                  placeholder="23"
                  keyboard="decimal"
                />
                {form.warnings.map((warning) => (
                  <Text key={warning} style={styles.warning}>
                    {warning}
                  </Text>
                ))}
              </View>
            ) : null}

            {form.fieldError ? <Text style={styles.error}>{form.fieldError}</Text> : null}
          </Animated.View>

          <View style={styles.actions}>
            <Button
              label={form.step === 'measures' ? 'Salvar caminhão' : 'Continuar'}
              loading={form.saving}
              disabled={form.busy}
              onPress={() => {
                void form.goNext()
              }}
            />
            <Button
              label="Voltar"
              variant="outline"
              disabled={form.busy || form.stepIndex === 0}
              invisible={form.stepIndex === 0}
              onPress={form.goBack}
            />
            <Button
              label="Pular por agora"
              variant="outline"
              loading={form.skipping}
              disabled={form.busy}
              onPress={() => {
                void form.skip()
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

function Choice({
  icon,
  label,
  hint,
  selected,
  onPress,
}: {
  icon: 'person-outline' | 'bus-outline'
  label: string
  hint?: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={pressStyle([styles.choice, selected ? styles.choiceSelected : null], {
        opacity: 0.9,
        pressed: styles.choicePressed,
      })}
    >
      <View style={[styles.choiceIcon, selected ? styles.choiceIconOn : null]}>
        <Icon name={icon} size={20} color={selected ? tokens.color.brand : tokens.color.muted} />
      </View>
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceLabel}>{label}</Text>
        {hint ? <Text style={styles.choiceHint}>{hint}</Text> : null}
      </View>
      <View style={styles.checkSlot}>
        <Icon
          name="checkmark-circle"
          size={22}
          color={selected ? tokens.color.brand : 'transparent'}
        />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.color.fog,
  },
  scroll: {
    paddingHorizontal: tokens.space[5],
    paddingTop: tokens.space[4],
    paddingBottom: tokens.space[8],
    gap: tokens.space[4],
  },
  progressRow: {
    gap: 4,
  },
  step: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    color: tokens.color.ink,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: tokens.color.line,
  },
  dotActive: {
    backgroundColor: tokens.color.brand,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.line,
    marginBottom: tokens.space[4],
  },
  title: {
    fontFamily: tokens.font.sign,
    fontSize: 30,
    lineHeight: 36,
    color: tokens.color.ink,
    marginBottom: tokens.space[2],
  },
  choices: {
    gap: tokens.space[2],
    marginTop: tokens.space[4],
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
    borderWidth: 1,
    borderColor: tokens.color.line,
    borderRadius: tokens.radius.field,
    padding: tokens.space[4],
    backgroundColor: tokens.color.surface,
  },
  choiceSelected: {
    borderColor: tokens.color.brand,
    backgroundColor: '#EAF4FB',
  },
  choicePressed: {
    backgroundColor: tokens.color.fog,
  },
  choiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.fog,
  },
  choiceIconOn: {
    backgroundColor: '#D7ECF7',
  },
  choiceCopy: {
    flex: 1,
    gap: 2,
  },
  choiceLabel: {
    fontFamily: tokens.font.label,
    fontSize: tokens.size.body,
    color: tokens.color.ink,
  },
  choiceHint: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.muted,
  },
  checkSlot: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fields: {
    gap: tokens.space[3],
    marginTop: tokens.space[4],
  },
  warning: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.danger,
  },
  error: {
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
    color: tokens.color.danger,
  },
  actions: {
    gap: tokens.space[2],
    marginTop: tokens.space[2],
  },
})
