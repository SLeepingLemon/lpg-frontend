import { Camera, Trash2, UserRound } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { FormAlert } from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { AVATAR_MAX_UPLOAD_MB, AVATAR_SIZE_PX } from '../config/constants'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { getAuthErrorMessage } from '../utils/authErrors'
import { resizeImageToDataUrl } from '../utils/imageUtils'
import {
  collectErrors,
  normalizePhone,
  validateFullName,
  validatePhone,
  validateUsername,
} from '../utils/validators'

const fromUser = (user) => ({
  fullName: user?.displayName ?? '',
  username: user?.username ?? '',
  phone: user?.phone ?? '',
  photoURL: user?.photoURL ?? null,
})

const validate = (v) =>
  collectErrors({
    fullName: () => validateFullName(v.fullName),
    username: () => validateUsername(v.username),
    phone: () => validatePhone(v.phone),
  })

const FIELD_LABELS = { fullName: 'name', username: 'username', phone: 'mobile number', photoURL: 'photo' }

function PhotoPicker({ name, photoURL, onChange, disabled }) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) return setError('Choose an image file (JPG, PNG or WebP).')
    if (file.size > AVATAR_MAX_UPLOAD_MB * 1024 * 1024) return setError(`Image must be under ${AVATAR_MAX_UPLOAD_MB} MB.`)
    setProcessing(true)
    try {
      onChange(await resizeImageToDataUrl(file, AVATAR_SIZE_PX))
    } catch {
      setError('Could not read that image. Try a different file.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      <Avatar name={name} photoURL={photoURL} size="lg" />
      <div>
        <p className="font-semibold text-ink">Profile photo</p>
        <p className="mt-0.5 text-sm text-slate-600">JPG, PNG or WebP, up to {AVATAR_MAX_UPLOAD_MB} MB. Cropped to a square.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <input ref={inputRef} id={inputId} type="file" accept="image/*" className="sr-only" onChange={handleFile} disabled={disabled} />
          <Button variant="secondary" size="sm" loading={processing} disabled={disabled} onClick={() => inputRef.current?.click()}>
            {!processing && <Camera className="size-4" aria-hidden="true" />}
            {photoURL ? 'Change photo' : 'Upload photo'}
          </Button>
          {photoURL && (
            <Button variant="ghost" size="sm" disabled={disabled || processing} onClick={() => onChange(null)}>
              <Trash2 className="size-4" aria-hidden="true" /> Remove
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { notify } = useNotifications()
  const [saved, setSaved] = useState(() => fromUser(user))
  const [values, setValues] = useState(saved)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // { tone, message }
  const [serverErrors, setServerErrors] = useState({})

  const errors = { ...(submitted ? validate(values) : {}), ...serverErrors }
  const changedFields = Object.keys(values).filter((key) => values[key] !== saved[key])
  const dirty = changedFields.length > 0

  const setField = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }))
    setServerErrors((e) => ({ ...e, [field]: undefined }))
    setStatus(null)
  }
  const onChange = (e) => setField(e.target.name, e.target.value)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    const found = validate(values)
    const first = Object.keys(found)[0]
    if (first) return e.currentTarget.elements.namedItem(first)?.focus()

    const changes = Object.fromEntries(changedFields.map((key) => [key, key === 'phone' ? normalizePhone(values[key]) : values[key]]))
    if (typeof changes.fullName === 'string') changes.fullName = changes.fullName.trim()
    if (typeof changes.username === 'string') changes.username = changes.username.trim()

    setSaving(true)
    setStatus(null)
    try {
      await updateProfile(changes)
      const next = { ...values, ...changes }
      setSaved(next)
      setValues(next)
      setSubmitted(false)
      setStatus({ tone: 'success', message: 'Your profile was updated.' })
      const what = changedFields.map((f) => FIELD_LABELS[f]).join(', ')
      notify({ type: 'profile_updated', title: 'Profile updated', message: `You changed your ${what}.` }).catch(() => {})
    } catch (err) {
      if (err?.code === 'profile/username-taken') setServerErrors({ username: getAuthErrorMessage(err) })
      else setStatus({ tone: 'error', message: getAuthErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setValues(saved)
    setSubmitted(false)
    setServerErrors({})
    setStatus(null)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Your profile</h1>
      <p className="mt-1 text-sm text-slate-600">Update how you appear in Smart LPG.</p>

      <form noValidate onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <FormAlert tone={status?.tone}>{status?.message}</FormAlert>

        <Card title="Photo" icon={Camera}>
          <PhotoPicker name={values.fullName} photoURL={values.photoURL} onChange={(url) => setField('photoURL', url)} disabled={saving} />
        </Card>

        <Card title="Personal details" icon={UserRound}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="fullName"
              label="Full name"
              autoComplete="name"
              value={values.fullName}
              onChange={onChange}
              error={errors.fullName}
              className="sm:col-span-2"
            />
            <FormField
              id="username"
              label="Username"
              autoComplete="username"
              helper="You can use letters, numbers & periods."
              value={values.username}
              onChange={onChange}
              error={errors.username}
            />
            <FormField
              id="phone"
              label="Mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="ex.09xx-xxx-xxxx"
              value={values.phone}
              onChange={onChange}
              error={errors.phone}
            />
            <FormField
              id="email"
              label="Email address"
              type="email"
              value={user?.email ?? ''}
              readOnly
              aria-readonly="true"
              helper="Your sign-in email can't be changed here."
              className="sm:col-span-2 [&_input]:bg-slate-50 [&_input]:text-slate-600"
            />
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" disabled={!dirty || saving} onClick={handleReset}>
            Discard changes
          </Button>
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </form>
    </main>
  )
}
