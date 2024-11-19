const escapeRegExp = (string: String): String => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const compareLabels = (
  labels: string[],
  labelsSynonyms: Record<string, string[]>
): ((line: string) => string[]) => {
  const labelsRegex = labels.length
    ? new RegExp(
        labels
          .map((elem) => {
            if (labelsSynonyms[elem] === undefined) {
              return `\\b${escapeRegExp(elem)}\\b`
            } else {
              return [elem, ...labelsSynonyms[elem]]
                .map((synonym) => `\\b${escapeRegExp(synonym)}\\b`)
                .join('|')
            }
          })
          .join('|'),
        'gi'
      )
    : null
  let synonymsObject: Record<string, string[]> = {}
  for (let label in labelsSynonyms) {
    labelsSynonyms[label].forEach((synonym) => {
      synonymsObject[synonym.toLowerCase()] = [
        ...(synonymsObject[synonym.toLowerCase()] || []),
        label
      ]
    })
  }
  const hasLabels = (line: string): string[] => {
    const selectedLabels = labelsRegex ? line.match(labelsRegex) || [] : []
    return selectedLabels.flatMap((elem) => {
      return (
        synonymsObject[elem.toLowerCase()] ||
        labels.find((label) => label.toLowerCase() === elem.toLowerCase()) ||
        elem
      )
    })
  }
  return hasLabels
}

export const getIssueLabels = (
  text: string,
  labels: string[],
  labelsSynonyms: Record<string, string[]>
): string[] => {
  const selectedLabels: string[] = []
  const hasLabels = compareLabels(labels, labelsSynonyms)

  hasLabels(text).forEach((elem) => {
    selectedLabels.push(elem)
  })

  return selectedLabels
}
