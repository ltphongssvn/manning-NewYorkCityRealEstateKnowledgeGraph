import { describe, it, expect } from 'vitest'
import { formatBBL } from './utils'

describe('formatBBL', () => {
  it('trims whitespace from valid BBL', () => {
    expect(formatBBL('  1008350041  ')).toBe('1008350041')
  })
  it('throws on empty string', () => {
    expect(() => formatBBL('')).toThrow('BBL cannot be empty')
  })
  it('returns unchanged valid BBL', () => {
    expect(formatBBL('1006971016')).toBe('1006971016')
  })
})
