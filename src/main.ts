const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    const token = core.getInput('repo-token', {required: true})
    const allowCreate = core.getInput('allow-create')
    const isHidden = core.getInput('is-hidden')
    const client = new github.GitHub(token)
    const context = github.context

    let labels: string[] = getLabels(context.payload.issue.body, isHidden)
    console.log(`Labels found: ${labels.length}`)
    if (!allowCreate) {
      console.log('Removing uncreated labels...')
      labels = await removeUncreatedLabels(client, labels)
    }
    console.log('Adding labels to issue...')
    await addLabels(client, context.payload.issue.number, labels)
    console.log('Done')
    console.log(`${labels.length} labels added`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function removeUncreatedLabels(
  client: any,
  labels: string[]
) {
  const {data: list} = await client.issues.listLabelsForRepo({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo
  })
  console.log(list)
  const labelNames: object = {}
  list.forEach((elem: any) => {
    labelNames[elem.name] = true
  })
  return labels.filter((elem: string) => labelNames[elem])
}

async function addLabels(
  client: any,
  issueNumber: number,
  labels: string[]
) {
  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber,
    labels: labels
  })
}

function getLabels (body: string, isHidden: boolean) {
  let comentary: boolean = false
  let labels: string[] = []
  if (isHidden) {
    body.split('\n').forEach((line: string) => {
      if (line.includes('<!--')) {
        comentary = true
      } if (line.includes('-->')) {
        comentary = false
      }
      if (comentary) {
          if ((/\[\s*x\s*\]/i).test(line)) {
            labels.push(line.split(/\[\s*x\s*\]/i)[1].trim())
        } 
      }
    })
  } else {
    body.split('\n').forEach((line: string) => {
      if ((/\[\s*x\s*\]/i).test(line)) {
        labels.push(line.split(/\[\s*x\s*\]/i)[1].trim())
      } 
    })
  }
  
  return labels
}

run()
