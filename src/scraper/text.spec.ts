import { expect, describe, test } from 'bun:test'
import { getIssueLabels } from './text'

describe('getIssueLabels function', () => {
  test('should return an array of labels extracted from body', () => {
    const body =
      'Body with labels <!-- AUTO-LABEL:START --> Label1 Label2 <!-- AUTO-LABEL:END -->'
    const labels = ['Label1', 'Label2']

    const result = getIssueLabels(body, labels, {})

    expect(result).toEqual(['Label1', 'Label2'])
  })

  test('should handle no labels in body', () => {
    const body = 'No labels in this body'
    const labels = ['Label1', 'Label2']
    const result = getIssueLabels(body, labels, {})

    expect(result).toEqual([])
  })

  test('should check if there is any synonym for the labels available', () => {
    const body = 'Body with labels: Synonym1'
    const labels = ['Label1', 'Label2']
    const labelsSynonyms = { Label1: ['Synonym1'], Label2: ['Synonym2'] }

    const result = getIssueLabels(body, labels, labelsSynonyms)

    expect(result).toEqual(['Label1'])
  })

  test('should add 2 labels when there is a synonym for the labels available', () => {
    const body = 'Body with labels: Synonym1'
    const labels = ['Label1', 'Label2']
    const labelsSynonyms = { Label1: ['Synonym1'], Label2: ['Synonym1'] }

    const result = getIssueLabels(body, labels, labelsSynonyms)

    expect(result).toEqual(['Label1', 'Label2'])
  })
})
