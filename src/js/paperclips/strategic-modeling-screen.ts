import { d3 } from '../chart'
import { HalScreen, HalColors } from './hal-screen-base'
import './hal-screen-types'

const DEV_MODE = true  // Set to false for production

type StrategicModelingData = {
  yomi?: number
  strats?: Array<{ name?: string; currentScore?: number }>
  rounds?: number
  currentRound?: number
}

export class StrategicModelingScreen extends HalScreen {
  private lastPayoffValues = {aa: '', ab: '', ba: '', bb: ''}
  private lastCurrentRound = 0
  private lastRounds = 0
  private tournamentRunning = false
  private flashAnimationId: number | null = null
  private cellRects: Map<string, d3.Selection<d3.BaseType, unknown, HTMLElement, any>> = new Map()
  private initialized = false
  private lastYomi = -1
  private lastStratsHash = ''
  
  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-strategic-modeling',
      container: opts.container,
      width: 600,
      height: 600,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.burgundy)  // Burgundy for strategic/combat
    
    // Make screen accessible globally for debugging
    if (DEV_MODE) {
      ;(window as any).strategicModelingScreen = this
      console.log('[StrategicModelingScreen] Debug mode: window.strategicModelingScreen available')
    }
  }
  
  cancelFlashAnimation(): void {
    if (this.flashAnimationId !== null) {
      clearTimeout(this.flashAnimationId)
      this.flashAnimationId = null
    }
  }
  
  startFlashAnimation(roundsData: number): void {
    this.cancelFlashAnimation()
    
    // Ensure cellRects are populated before starting animation
    if (this.cellRects.size === 0) {
      console.warn('[StrategicModelingScreen] Cannot start animation: cellRects is empty. Payoff matrix may not be drawn yet.')
      return
    }
    
    console.log(`[StrategicModelingScreen] Starting flash animation for ${roundsData} rounds`)
    
    // Flash pattern: AA, AB, BA, BB (repeats 10 times per round)
    const pattern = ['aa', 'ab', 'ba', 'bb']
    const flashesPerRound = 10
    const totalFlashes = roundsData * flashesPerRound
    let flashIndex = 0
    
    const doFlash = () => {
      if (flashIndex >= totalFlashes) {
        this.tournamentRunning = false
        console.log('[StrategicModelingScreen] Flash animation completed')
        return
      }
      
      const cellKey = pattern[flashIndex % pattern.length]
      const rect = this.cellRects.get(cellKey)
      
      if (rect && rect.node()) {
        // Flash on
        rect.attr('fill', 'rgba(255,255,255,0.4)')
        
        // Flash off after 50ms
        setTimeout(() => {
          if (rect && rect.node()) {
            rect.attr('fill', 'rgba(0,0,0,0.3)')
          }
        }, 50)
      } else {
        console.warn(`[StrategicModelingScreen] Cell rect not found for key: ${cellKey}`)
      }
      
      flashIndex++
      this.flashAnimationId = setTimeout(doFlash, 100) as any
    }
    
    doFlash()
  }
  
  // Public method for testing animation
  testAnimation(rounds: number = 8): void {
    console.log(`[StrategicModelingScreen] Testing animation with ${rounds} rounds`)
    this.startFlashAnimation(rounds)
  }
  
  draw(data?: StrategicModelingData): void {
    const colors: HalColors = {
      text: '#ffffff',
      labelGrey: '#cfe8ff',
      yellow: '#ffe66d',
      cyan: '#4ecdc4',
      background: this.colors.background
    }
    
    // Use passed data or fall back to globals
    const yomiValue = data?.yomi ?? (typeof yomi !== 'undefined' ? yomi : 0)
    const stratsData = data?.strats ?? (typeof strats !== 'undefined' ? strats : [])
    const roundsData = data?.rounds ?? (typeof rounds !== 'undefined' ? rounds : 0)
    const currentRoundData = data?.currentRound ?? (typeof currentRound !== 'undefined' ? currentRound : 0)
    
    // Check if we need to initialize (first draw)
    if (!this.initialized) {
      this.initializeStaticElements(colors)
      this.initialized = true
    }
    
    // Detect tournament start/stop
    const shouldStartAnimation = currentRoundData === 1 && this.lastCurrentRound === 0 && roundsData > 0
    const shouldStopAnimation = (currentRoundData >= roundsData && roundsData > 0) || (currentRoundData === 0 && this.lastCurrentRound > 0)
    
    if (shouldStopAnimation) {
      // Tournament finished or reset
      this.tournamentRunning = false
      this.cancelFlashAnimation()
    }
    
    // Update dynamic content only
    this.updateDynamicContent(colors, yomiValue, stratsData, roundsData, currentRoundData)
    
    // Update payoff matrix (only if values changed)
    const payoffChanged = this.updatePayoffMatrix(colors)
    
    // Update tournament progress
    this.updateTournamentProgress(colors, stratsData, roundsData, currentRoundData)
    
    // Trigger animation if tournament just started (after payoff matrix is updated)
    if (shouldStartAnimation && payoffChanged) {
      setTimeout(() => {
        this.tournamentRunning = true
        this.startFlashAnimation(roundsData)
      }, 100)
    }
    
    this.lastCurrentRound = currentRoundData
    this.lastRounds = roundsData
    this.lastYomi = yomiValue
    this.lastStratsHash = JSON.stringify(stratsData)
  }
  
  private initializeStaticElements(colors: HalColors): void {
    // Title
    this.svg.append('text')
      .attr('id', 'title')
      .attr('x', 20).attr('y', 30)
      .attr('fill', colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18).attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('STRATEGIC MODELING')
    
    // Strategy buttons (static)
    const strategies = ['RANDOM', 'A100', 'B100', 'GREEDY', 'GENEROUS', 'MINIMAX', 'TIT FOR TAT', 'BEAT LAST']
    const pickerY = 60
    
    this.svg.append('text')
      .attr('id', 'select-strategy-label')
      .attr('x', 20).attr('y', pickerY)
      .attr('fill', colors.labelGrey)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12)
      .text('SELECT STRATEGY:')
    
    strategies.forEach((strat, i) => {
      const x = 20 + (i % 4) * 140
      const y = pickerY + 20 + Math.floor(i / 4) * 40
      
      const btn = this.svg.append('g')
        .attr('id', `strat-btn-${i}`)
        .style('cursor', 'pointer')
      
      btn.append('rect')
        .attr('x', x).attr('y', y)
        .attr('width', 130).attr('height', 30)
        .attr('fill', 'rgba(255,255,255,0.1)')
        .attr('stroke', 'rgba(255,255,255,0.3)')
        .attr('rx', 3)
      
      btn.append('text')
        .attr('x', x + 65).attr('y', y + 19)
        .attr('fill', colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 10).attr('text-anchor', 'middle')
        .text(strat)
      
      btn.on('mouseover', function() {
        d3.select(this).select('rect').attr('fill', 'rgba(255,255,255,0.2)')
      })
      .on('mouseout', function() {
        d3.select(this).select('rect').attr('fill', 'rgba(255,255,255,0.1)')
      })
      .on('click', () => {
        const picker = document.getElementById('stratPicker') as HTMLSelectElement
        if (picker) {
          for (let j = 0; j < picker.options.length; j++) {
            if (picker.options[j].text === strat) {
              picker.selectedIndex = j
              break
            }
          }
        }
      })
    })
    
    // Run/New buttons (static)
    const btnY = pickerY + 100
    this.drawButton(20, btnY, 150, 35, 'RUN TOURNAMENT', colors.yellow, () => {
      const btn = document.getElementById('btnRunTournament') as HTMLButtonElement
      if (btn && !btn.disabled) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      }
    })
    
    this.drawButton(190, btnY, 150, 35, 'NEW TOURNAMENT', colors.cyan, () => {
      const btn = document.getElementById('btnNewTournament') as HTMLButtonElement
      if (btn) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      }
    })
    
    // Dev mode: Test animation button
    if (DEV_MODE) {
      this.drawButton(360, btnY, 120, 35, 'TEST ANIM', '#ff6b6b', () => {
        console.log('[StrategicModelingScreen] Test animation button clicked')
        this.testAnimation(8)
      })
    }
  }
  
  private updateDynamicContent(colors: HalColors, yomiValue: number, stratsData: Array<{ name?: string; currentScore?: number }>, roundsData: number, currentRoundData: number): void {
    // Update tournament status indicator
    let statusIndicator = this.svg.select('#tournament-status')
    if (this.tournamentRunning) {
      if (statusIndicator.empty()) {
        statusIndicator = this.svg.append('text')
          .attr('id', 'tournament-status')
          .attr('x', 350).attr('y', 30)
          .attr('fill', colors.yellow)
          .attr('font-family', 'Consolas, "Fira Mono", monospace')
          .attr('font-size', 12)
      }
      statusIndicator.text('● RUNNING')
    } else {
      statusIndicator.remove()
    }
    
    // Update Yomi display
    let yomiDisplay = this.svg.select('#yomi-display')
    if (yomiDisplay.empty()) {
      yomiDisplay = this.svg.append('text')
        .attr('id', 'yomi-display')
        .attr('x', 450).attr('y', 30)
        .attr('fill', colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 14)
    }
    yomiDisplay.text(`YOMI: ${yomiValue.toLocaleString()}`)
  }
  
  private updatePayoffMatrix(colors: HalColors): boolean {
    const startY = 220  // btnY + 100 + 60
    let payoffLabel = this.svg.select('#payoff-label')
    
    if (payoffLabel.empty()) {
      payoffLabel = this.svg.append('text')
        .attr('id', 'payoff-label')
        .attr('x', 20).attr('y', startY)
        .attr('fill', colors.labelGrey)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 11)
        .text('PAYOFF MATRIX')
    }
    
    const cellSize = 80
    const matrixStartX = 120
    const matrixStartY = startY + 30
    
    // Get values from DOM
    const getVal = (id: string) => document.getElementById(id)?.textContent || '0'
    const aa = [getVal('aaPayoffH'), getVal('aaPayoffV')]
    const ab = [getVal('abPayoffH'), getVal('abPayoffV')]
    const ba = [getVal('baPayoffH'), getVal('baPayoffV')]
    const bb = [getVal('bbPayoffH'), getVal('bbPayoffV')]
    
    const currentValues = {
      aa: aa.join(','), ab: ab.join(','),
      ba: ba.join(','), bb: bb.join(',')
    }
    
    // Check if values changed
    const valuesChanged = Object.keys(currentValues).some(
      key => this.lastPayoffValues[key as keyof typeof this.lastPayoffValues] !== currentValues[key as keyof typeof currentValues]
    )
    
    if (!valuesChanged && this.cellRects.size > 0) {
      // Values haven't changed and cells already exist, skip redraw
      return false
    }
    
    // Get move labels from DOM
    const hLabelA = getVal('hLabela') || 'Move A'
    const hLabelB = getVal('hLabelb') || 'Move B'
    const vLabelA = getVal('vLabela') || 'Move A'
    const vLabelB = getVal('vLabelb') || 'Move B'
    
    // Update headers
    this.updateTextElement('payoff-header-v1', matrixStartX + cellSize/2, matrixStartY - 10, vLabelA, colors.text, 'middle')
    this.updateTextElement('payoff-header-v2', matrixStartX + cellSize + cellSize/2, matrixStartY - 10, vLabelB, colors.text, 'middle')
    this.updateTextElement('payoff-header-h1', matrixStartX - 10, matrixStartY + cellSize/2 + 5, hLabelA, colors.text, 'end')
    this.updateTextElement('payoff-header-h2', matrixStartX - 10, matrixStartY + cellSize + cellSize/2 + 5, hLabelB, colors.text, 'end')
    
    // Update cells
    const cells = [
      {x: 0, y: 0, values: aa, key: 'aa'},
      {x: 1, y: 0, values: ab, key: 'ab'},
      {x: 0, y: 1, values: ba, key: 'ba'},
      {x: 1, y: 1, values: bb, key: 'bb'}
    ]
    
    cells.forEach(cell => {
      const x = matrixStartX + cell.x * cellSize
      const y = matrixStartY + cell.y * cellSize
      const changed = this.lastPayoffValues[cell.key as keyof typeof this.lastPayoffValues] !== currentValues[cell.key as keyof typeof currentValues]
      
      // Update or create rect
      let rect = this.svg.select(`#payoff-cell-${cell.key}`)
      if (rect.empty()) {
        rect = this.svg.append('rect')
          .attr('id', `payoff-cell-${cell.key}`)
          .attr('x', x).attr('y', y)
          .attr('width', cellSize).attr('height', cellSize)
          .attr('stroke', 'rgba(255,255,255,0.4)')
        
        // Store rect for flash animation
        this.cellRects.set(cell.key, rect)
      }
      
      rect.attr('fill', changed ? 'rgba(255,230,100,0.4)' : 'rgba(0,0,0,0.3)')
      
      if (changed) {
        rect.transition().duration(300).attr('fill', 'rgba(0,0,0,0.3)')
      }
      
      // Update or create text
      this.updateTextElement(`payoff-text-${cell.key}`, x + cellSize/2, y + cellSize/2 + 5, 
        `${cell.values[0]}, ${cell.values[1]}`, colors.text, 'middle', 16, 'bold')
    })
    
    this.lastPayoffValues = currentValues
    return true
  }
  
  private updateTextElement(id: string, x: number, y: number, text: string, fill: string, anchor: string = 'start', fontSize: number = 12, fontWeight: string = 'normal') {
    let element = this.svg.select(`#${id}`)
    if (element.empty()) {
      element = this.svg.append('text')
        .attr('id', id)
        .attr('x', x).attr('y', y)
        .attr('fill', fill)
        .attr('font-family', 'Consolas, monospace')
        .attr('font-size', fontSize)
        .attr('font-weight', fontWeight)
        .attr('text-anchor', anchor)
    }
    element.text(text)
  }
  
  private updateTournamentProgress(colors: HalColors, stratsData: Array<{ name?: string; currentScore?: number }>, roundsData: number, currentRoundData: number): void {
    const startY = 460  // btnY + 100 + 300
    let progressLabel = this.svg.select('#tournament-progress-label')
    
    if (progressLabel.empty()) {
      progressLabel = this.svg.append('text')
        .attr('id', 'tournament-progress-label')
        .attr('x', 20).attr('y', startY)
        .attr('fill', colors.labelGrey)
        .attr('font-family', 'Consolas, monospace')
        .attr('font-size', 11)
        .text('TOURNAMENT PROGRESS')
    }
    
    // Remove old progress items
    this.svg.selectAll('.tournament-progress-item').remove()
    
    // If we have strats data, use it
    if (stratsData && stratsData.length > 0 && roundsData) {
      this.updateTextElement('tournament-round', 20, startY + 25, 
        `Round ${currentRoundData} / ${roundsData}`, colors.text, 'start', 14)
      
      const sorted = [...stratsData].sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0))
      sorted.slice(0, 3).forEach((strat, i) => {
        this.svg.append('text')
          .attr('class', 'tournament-progress-item')
          .attr('x', 20).attr('y', startY + 50 + i * 18)
          .attr('fill', colors.text)
          .attr('font-family', 'Consolas, monospace')
          .attr('font-size', 11)
          .text(`${i+1}. ${strat.name}: ${strat.currentScore || 0}`)
      })
    } else {
      // Fallback: parse from DOM
      const results: string[] = []
      for (let i = 0; i < 8; i++) {
        const elem = document.getElementById(`results${i}`)
        if (elem && elem.textContent && elem.textContent.trim()) {
          results.push(elem.textContent.trim())
        }
      }
      
      if (results.length > 0) {
        this.updateTextElement('tournament-results', 20, startY + 25, 'RESULTS', colors.text, 'start', 14)
        results.slice(0, 3).forEach((result, i) => {
          this.svg.append('text')
            .attr('class', 'tournament-progress-item')
            .attr('x', 20).attr('y', startY + 50 + i * 18)
            .attr('fill', colors.text)
            .attr('font-family', 'Consolas, monospace')
            .attr('font-size', 11)
            .text(result)
        })
      } else {
        const noDataElement = this.svg.select('#tournament-no-data')
        if (noDataElement.empty()) {
          this.svg.append('text')
            .attr('id', 'tournament-no-data')
            .attr('x', 20).attr('y', startY + 25)
            .attr('fill', colors.text)
            .attr('font-family', 'Consolas, monospace')
            .attr('font-size', 12)
            .attr('opacity', 0.5)
            .text('No tournament data')
        }
      }
    }
  }
  
  private drawButton(x: number, y: number, w: number, h: number, text: string, color: string, onClick: () => void): void {
    const btn = this.svg.append('g').style('cursor', 'pointer')
    btn.append('rect')
      .attr('x', x).attr('y', y).attr('width', w).attr('height', h)
      .attr('fill', `${color}33`).attr('stroke', color).attr('rx', 4)
    btn.append('text')
      .attr('x', x + w/2).attr('y', y + h/2 + 5)
      .attr('fill', color).attr('font-family', 'Futura, sans-serif')
      .attr('font-size', 14).attr('font-weight', 'bold').attr('text-anchor', 'middle')
      .text(text)
    btn.on('click', onClick)
  }
}

