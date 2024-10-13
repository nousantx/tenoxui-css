#!/bin/node

import fs from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import readline from 'node:readline'

// default color
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// default config
const defaultConfig = {
  packageManager: 'npm',
  workspacesDirs: ['packages/*']
}

// Utility function to match simple glob patterns (e.g., "packages/*")
function matchPattern(pattern, dirName) {
  if (pattern === '*') return true
  return pattern === dirName
}

// Function to list directories matching a glob pattern (basic support for "*") 🗿
function resolveWorkspaces(pattern, baseDir) {
  const parts = pattern.split(path.sep)
  const rootPart = parts[0]
  const subPattern = parts.slice(1).join(path.sep)

  let results = []

  // Read all directories from the baseDir
  const dirContent = fs.readdirSync(baseDir, { withFileTypes: true })

  dirContent.forEach((dirent) => {
    if (dirent.isDirectory() && matchPattern(rootPart, dirent.name)) {
      const fullPath = path.join(baseDir, dirent.name)

      // If there's no more sub-pattern to match, it's a final match
      if (!subPattern) {
        results.push(fullPath)
      } else {
        // Recurse into the directory to match the rest of the pattern
        results = results.concat(resolveWorkspaces(subPattern, fullPath))
      }
    }
  })

  return results
}

// Find the root directory by checking if any workspace directory exists
function findRootDir(workspacesDirs = defaultConfig.workspacesDirs) {
  let currentDir = process.cwd()
  const root = path.parse(currentDir).root

  // Check for any directory that matches the workspace directories
  while (
    !workspacesDirs.some((wsDir) =>
      fs.existsSync(path.join(currentDir, wsDir.replace(/\*/g, '')))
    ) &&
    currentDir !== root
  ) {
    currentDir = path.dirname(currentDir)
  }

  return currentDir !== root ? currentDir : process.cwd()
}

// Load config
function loadConfig() {
  const rootDir = findRootDir(defaultConfig.workspacesDirs)
  const configPath = path.join(rootDir, 'workspace.json')
  let config = defaultConfig

  if (fs.existsSync(configPath)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      config = { ...config, ...userConfig }
    } catch (error) {
      console.error(`${colors.red}Error reading config file: ${error.message}${colors.reset}`)
    }
  }

  return config
}

const packageJson = JSON.parse(
  fs.readFileSync(path.join(findRootDir(loadConfig().workspacesDirs), 'package.json'), 'utf-8')
)
const config = loadConfig()

function getPackages() {
  const rootDir = findRootDir(config.workspacesDirs)
  let allPackages = []

  config.workspacesDirs.forEach((workspaceDir) => {
    const matchedDirs = resolveWorkspaces(workspaceDir, rootDir)

    matchedDirs.forEach((dir) => {
      if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
        const packageJsonPath = path.join(dir, 'package.json')
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
          allPackages.push({
            name: packageJson.name || path.basename(dir),
            path: dir
          })
        }
      }
    })
  })

  return allPackages
}

// Get every scripts from all workspaces
function getScripts(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json')

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    return packageJson.scripts || {}
  }

  return {}
}

// New list scripts function
function listScripts() {
  const packages = getPackages()

  packages.forEach(({ name, path: packagePath }) => {
    const scripts = getScripts(packagePath)

    console.log(
      `${colors.dim}— workspace:${colors.reset}${colors.bright}${colors.cyan}${name}${colors.reset}`
    )
    if (Object.keys(scripts).length > 0) {
      Object.entries(scripts).forEach(([scriptName, scriptCmd]) => {
        console.log(
          `${colors.dim}> ${colors.reset}${colors.green}${scriptName}${colors.reset}${colors.dim}: ${scriptCmd}${colors.reset}`
        )
      })
    } else {
      console.log(`${colors.yellow}─ No scripts found.${colors.reset}`)
    }
    console.log()
  })
}

// What package manager the user define on the config
function getPackageManagerCommand(packageManager, workspace, scriptName) {
  switch (packageManager.toLowerCase()) {
    case 'npm':
      return `npm run ${scriptName} --workspace=${workspace}`

    case 'yarn':
      return `yarn workspace ${workspace} run ${scriptName}`

    // not too recommend, use pnpm-workspace instead 🗿
    case 'pnpm':
      return `pnpm --filter ${workspace} run ${scriptName}`

    default:
      console.warn(
        `${colors.yellow}Warning: Unknown package manager "${packageManager}". Defaulting to npm.${colors.reset}`
      )

      return `npm run ${scriptName} --workspace=${workspace}`
  }
}

// Execute the script
function runScript(workspace, scriptName) {
  const command = getPackageManagerCommand(config.packageManager, workspace, scriptName)
  const startTime = process.hrtime()

  console.log(`${colors.dim}> ${command}${colors.reset}`)

  try {
    execSync(command, { stdio: 'inherit' })
    if (config.packageManager === 'npm' || config.packageManager === 'pnpm') {
      const [seconds, nanoseconds] = process.hrtime(startTime)
      const duration = (seconds * 1000 + nanoseconds / 1e6).toFixed(2)

      console.log(`${colors.green}Done in ${duration}ms${colors.reset}`)
    }
  } catch (error) {
    console.error(`${colors.red}Error executing script: ${error.message}${colors.reset}`)
  }
}

// New search scripts function
function searchScripts(searchTerm) {
  const packages = getPackages()
  const results = []

  packages.forEach(({ name, path }) => {
    const scripts = getScripts(path)

    Object.entries(scripts).forEach(([scriptName, scriptCmd]) => {
      if (scriptName.includes(searchTerm) || scriptCmd.includes(searchTerm)) {
        results.push({ workspace: name, name: scriptName, command: scriptCmd })
      }
    })
  })
  return results
}

// Display all available scripts with the term
function displaySearchResults(results) {
  if (results.length === 0) {
    console.log(`${colors.yellow}No matching scripts found.${colors.reset}`)

    return
  }

  console.log(`${colors.bright}Search results:${colors.reset}\n`)

  results.forEach(({ workspace, name, command }) => {
    console.log(`${colors.cyan}${workspace}${colors.reset} > ${colors.green}${name}${colors.reset}`)
    console.log(`${colors.dim}  ${command}${colors.reset}\n`)
  })
}

// Start interactive mode
function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log(`${colors.bright}Interactive Mode${colors.reset}`)
  console.log(
    "Type 'exit' to quit, 'list' to show all scripts, or 'search <term>' to search scripts."
  )

  rl.prompt()
  rl.on('line', (input) => {
    const [command, ...args] = input.trim().split(' ')

    switch (command.toLowerCase()) {
      case 'exit':
        rl.close()
        break

      case 'list':
        listScripts()
        break

      case 'search':
        if (args.length > 0) {
          const results = searchScripts(args.join(' '))

          displaySearchResults(results)
        } else {
          console.log(`${colors.yellow}Please provide a search term.${colors.reset}`)
        }
        break

      case 'run':
        if (args.length >= 2) {
          const [workspace, script] = args
          runScript(workspace, script)
        } else {
          console.log(
            `${colors.yellow}Please provide both workspace and script name.${colors.reset}`
          )
        }
        break

      default:
        console.log(
          `${colors.yellow}Unknown command. Try 'list', 'search', 'run', or 'exit'.${colors.reset}`
        )
    }

    rl.prompt()
  }).on('close', () => {
    console.log(`${colors.bright}Goodbye!${colors.reset}`)
    process.exit(0)
  })
}

const [, , action, ...args] = process.argv
const useWhat = 'wst'
const command = `${colors.reset}${colors.dim}  ${useWhat}${colors.reset}${colors.yellow}${colors.bright}`
const workspaceName = `${colors.dim}${colors.reset}${colors.cyan}${colors.bright}${packageJson.name}${colors.reset} ${colors.dim}v${packageJson.version}${colors.reset}`

// start the script
console.log(workspaceName)
if (action === undefined) {
  console.log(`\n${colors.dim}Usage:${colors.reset}`)
  console.log(
    `${command} list${colors.reset}${colors.dim} # List all scripts from all workspaces${colors.reset}`
  )
  console.log(
    `${command} run <workspace> <script>${colors.reset}${colors.dim} # Run a specific script from a workspace${colors.reset}`
  )
  console.log(
    `${command} search <term>${colors.reset}${colors.dim} # Search for a script by name or content${colors.reset}`
  )
  console.log(
    `${command} interactive${colors.reset}${colors.dim} # Start interactive mode${colors.reset}`
  )
  console.log(`\n${colors.reset}${colors.dim}Examples:${colors.reset}`)
  console.log(`${command} list`)
  console.log(`${command} run core build`)
  console.log(`${command} search test`)
  console.log(`${command} interactive`)
} else if (action === 'list') {
  listScripts()
} else if (action === 'run' && args.length >= 2) {
  const [workspace, script] = args
  runScript(workspace, script)
} else if (action === 'search' && args.length > 0) {
  const results = searchScripts(args.join(' '))
  displaySearchResults(results)
} else if (action === 'interactive') {
  interactiveMode()
} else {
  console.log(
    `${colors.red}Invalid command or missing arguments. Use without arguments to see usage.${colors.reset}`
  )
}
