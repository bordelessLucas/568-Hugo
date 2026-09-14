import { useMemo, useState } from 'react'
import {
  TRUCK_TYPES,
  dimensionWarnings,
  type Gender,
  type TruckType,
} from '@rotatrucks/back'
import { useAuth } from '../contexts/AuthContext.tsx'
import { toUserMessage } from '../lib/auth-errors.ts'
import { parseMeasure } from '../lib/measures.ts'

export const ONBOARDING_STEPS = ['gender', 'truck', 'measures'] as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

const STEP_COPY: Record<OnboardingStep, { title: string; body: string }> = {
  gender: {
    title: 'Quem está na direção',
    body: 'Isso fica no seu perfil. O mapa continua filtrando pelo caminhão, não por gênero.',
  },
  truck: {
    title: 'Qual é o caminhão',
    body: 'O tipo define quais marcações da comunidade aparecem para você.',
  },
  measures: {
    title: 'Medidas do veículo',
    body: 'Altura, largura, comprimento e peso total. O mapa usa esses números.',
  },
}

export function useOnboardingForm() {
  const auth = useAuth()
  const [step, setStep] = useState<OnboardingStep>('gender')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [gender, setGender] = useState<Gender | null>(auth.profile?.gender ?? null)
  const [truckType, setTruckType] = useState<TruckType | null>(null)
  const [height, setHeight] = useState('')
  const [width, setWidth] = useState('')
  const [length, setLength] = useState('')
  const [weightTons, setWeightTons] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [saving, setSaving] = useState(false)
  const [skipping, setSkipping] = useState(false)

  const stepIndex = ONBOARDING_STEPS.indexOf(step)
  const draft = useMemo(() => readDraft(height, width, length, weightTons), [height, length, weightTons, width])
  const warnings = draft ? dimensionWarnings(draft) : []

  const goNext = async () => {
    setFieldError('')
    if (step === 'gender') {
      if (!gender) {
        setFieldError('Escolha uma opção para continuar.')
        return
      }
      setDirection('forward')
      setStep('truck')
      return
    }
    if (step === 'truck') {
      if (!truckType || !TRUCK_TYPES.includes(truckType)) {
        setFieldError('Escolha o tipo de caminhão.')
        return
      }
      setDirection('forward')
      setStep('measures')
      return
    }
    await save()
  }

  const goBack = () => {
    setFieldError('')
    setDirection('back')
    if (step === 'measures') setStep('truck')
    if (step === 'truck') setStep('gender')
  }

  const skip = async () => {
    setFieldError('')
    setSkipping(true)
    try {
      await auth.dismissOnboarding(gender)
    } catch (caught) {
      setFieldError(toUserMessage(caught))
    } finally {
      setSkipping(false)
    }
  }

  const save = async () => {
    if (!auth.session || !gender || !truckType || !draft) {
      setFieldError(measureError(height, width, length, weightTons))
      return
    }
    setSaving(true)
    try {
      await auth.completeOnboarding({
        gender,
        truck: {
          userId: auth.session.uid,
          type: truckType,
          ...draft,
        },
      })
    } catch (caught) {
      setFieldError(toUserMessage(caught))
    } finally {
      setSaving(false)
    }
  }

  return {
    step,
    stepIndex,
    direction,
    copy: STEP_COPY[step],
    gender,
    setGender: (value: Gender) => {
      setFieldError('')
      setGender(value)
    },
    truckType,
    setTruckType: (value: TruckType) => {
      setFieldError('')
      setTruckType(value)
    },
    height,
    setHeight,
    width,
    setWidth,
    length,
    setLength,
    weightTons,
    setWeightTons,
    warnings,
    fieldError,
    saving,
    skipping,
    busy: saving || skipping,
    goNext,
    goBack,
    skip,
  }
}

function readDraft(height: string, width: string, length: string, weightTons: string) {
  const heightMeters = parseMeasure(height)
  const widthMeters = parseMeasure(width)
  const lengthMeters = parseMeasure(length)
  const tons = parseMeasure(weightTons)
  if (heightMeters === null || widthMeters === null || lengthMeters === null || tons === null) {
    return null
  }
  return {
    heightMeters,
    widthMeters,
    lengthMeters,
    totalWeightKg: Math.round(tons * 1000),
  }
}

function measureError(height: string, width: string, length: string, weightTons: string): string {
  if (parseMeasure(height) === null) return 'Informe a altura em metros, como 4,20.'
  if (parseMeasure(width) === null) return 'Informe a largura em metros, como 2,50.'
  if (parseMeasure(length) === null) return 'Informe o comprimento em metros, como 14,00.'
  if (parseMeasure(weightTons) === null) return 'Informe o peso total em toneladas, como 23.'
  return 'Revise as medidas do caminhão.'
}
