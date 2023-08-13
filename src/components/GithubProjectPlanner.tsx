/**
 * Tailwind Homepage
 * 
 * - has a 'open/closed/all' toggle for issues at the top left
 * - has a 'new issue' button at the top right
 * - has a 'filter' button at the top right
 * - main UI uses react-flow to create a graph of issues
 */
import React, { useEffect } from 'react'
import { NO_PROXY, useHookstate } from "@etherealengine/hyperflux"
import { useGet } from "@etherealengine/engine/src/common/functions/FeathersHooks"

import GithubFlow from './GithubFlow'
import { Node, Edge, Position } from 'reactflow'


export const GithubProjectPlanner = () => {
  const state = useHookstate({
    open: true,
    filter: '',
    issues: {
      nodes: [] as Node[],
      edges: [] as Edge[]
    },
    organization: 'etherealengine/etherealengine'
  })

  const rawIssues = useGet('github-project', state.organization.value)

  useEffect(() => {
    if (!rawIssues.data) {
      state.issues.set({
        nodes: [],
        edges: []
      })
      return 
    }

    const issues = rawIssues.data.filter((issue) => {
      return !issue.pull_request
    }) as {
      title: string
      body: string
      number: number
    }[]

    const nodes = issues.map((issue) => {
      return {
        id: `node-${issue.number}`,
        sourcePosition: 'right',
        targetPosition: 'left',
        data: {
          label: `#${issue.number} - ${issue.title}`,
        },
        position: {
          x: 0,
          y: 0
        }
      }
    }) as Node[]

    // generate edges by looking for `#123` or `/issues/123` in the body of the issue
    const edges: Edge[] = []
    issues.forEach((issue) => {
      if (!issue.body) return
      const matches = issue.body.match(/#(\d+)/g) ?? issue.body.match(/\/issues\/(\d+)/g)
      if (!matches) {
        return
      }


      matches.forEach((match: string) => {
        const id = match.replace('#', '')
        const target = nodes.find((node) => {
          return node.id === `node-${id}`
        })

        if (!target) {
          return
        }

        edges.push({
          id: `edge-${issue.number}-${target.id}`,
          source: `node-${issue.number}`,
          target: target.id
        })
      })
    })

    
    state.issues.set({
      nodes,
      edges
    })
  }, [rawIssues.data?.length])

  const open = state.open.value

  const toggle = () => {
    state.open.set(!open)
  }

  return (
    <div className="pointer-events-auto">
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between px-4 py-4 bg-gray-100">
          <div className="flex items-center">
            <button
              className="px-4 py-2 font-medium text-black bg-blue-600 rounded-md"
              onClick={toggle}
            >
              {open ? 'Open' : 'Closed'}
            </button>
            <button
              className="ml-4 px-4 py-2 font-medium text-black bg-blue-600 rounded-md"
              // onClick={toggle}
            >
              Filter
            </button>
            <button
              className="ml-4 px-4 py-2 font-medium text-black bg-blue-600 rounded-md"
              // onClick={toggle}
            >
              New Issue
            </button>
          </div>
          <div className="flex items-center">
            <button className="px-4 py-2 font-medium text-black bg-blue-600 rounded-md">
              Sign In
            </button>
          </div>
        </div>
        <div className="flex flex-1">
          <div className="flex flex-col flex-1">
            <div className="flex flex-1" />
            {state.issues.nodes.length && (
              <GithubFlow nodes={state.issues.nodes.get(NO_PROXY)} edges={state.issues.edges.get(NO_PROXY)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
