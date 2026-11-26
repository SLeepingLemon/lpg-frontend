import { describe, expect, it } from 'vitest'
import {
  collectErrors,
  validateEmail,
  validateNewPassword,
  validatePasswordMatch,
  validatePhone,
  validateUsername,
} from './validators'

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('juan@example.com')).toBe('')
  })
  it('rejects empty and malformed emails', () => {
    expect(validateEmail('')).toMatch(/required/)
    expect(validateEmail('juan@')).toMatch(/valid/)
    expect(validateEmail('juan@example')).toMatch(/valid/)
  })
})

describe('validatePhone', () => {
  it('accepts PH mobile formats', () => {
    expect(validatePhone('0917-123-4567')).toBe('')
    expect(validatePhone('09171234567')).toBe('')
    expect(validatePhone('+639171234567')).toBe('')
  })
  it('rejects other numbers', () => {
    expect(validatePhone('12345')).not.toBe('')
    expect(validatePhone('0817-123-4567')).not.toBe('')
  })
})

describe('validateUsername', () => {
  it('allows letters, numbers and periods', () => {
    expect(validateUsername('juan.dela.cruz2')).toBe('')
  })
  it('rejects other characters and bad periods', () => {
    expect(validateUsername('juan_dc')).not.toBe('')
    expect(validateUsername('.juan')).not.toBe('')
    expect(validateUsername('juan..dc')).not.toBe('')
  })
})

describe('validateNewPassword', () => {
  it('requires 8+ chars with letters, numbers and symbols', () => {
    expect(validateNewPassword('Abc123!x')).toBe('')
    expect(validateNewPassword('Ab1!')).toMatch(/8 or more/)
    expect(validateNewPassword('abcdefgh1')).toMatch(/mix/)
  })
})

describe('validatePasswordMatch', () => {
  it('requires matching passwords', () => {
    expect(validatePasswordMatch('Abc123!x', 'Abc123!x')).toBe('')
    expect(validatePasswordMatch('Abc123!x', 'Abc123!y')).toMatch(/do not match/)
  })
})

describe('collectErrors', () => {
  it('returns only failing fields', () => {
    expect(collectErrors({ a: () => '', b: () => 'bad' })).toEqual({ b: 'bad' })
  })
})
