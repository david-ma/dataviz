import { d3 } from '../chart'
import { HalScreen } from './hal-screen-base'
import './hal-screen-types'

export class StrategicModelingScreen extends HalScreen {
  private lastPayoffValues = {aa: '', ab: '', ba: '', bb: ''}
  private lastCurrentRound = 0
  private lastRounds = 0
  private tournamentRunning = false
  private flashAnimationId: number | null = null
  private cellRects: Map<string, any> = new Map()
  
  constructor(opts: { container: string; colors: any }) {
    super({
      id: 'hal-strategic-modeling',
      container: opts.container,
      width: 600,
      height: 600,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.burgundy)  // Burgundy for strategic/combat
  }
  
  cancelFlashAnimation() {
    if (this.flashAnimationId !== null) {
      clearTimeout(this.flashAnimationId)
      this.flashAnimationId = null
    }
  }
  
  startFlashAnimation(roundsData: number) {
    this.cancelFlashAnimation()
    
    // Flash pattern: AA, AB, BA, BB (repeats 10 times per round)
    const pattern = ['aa', 'ab', 'ba', 'bb']
    const flashesPerRound = 10
    const totalFlashes = roundsData * flashesPerRound
    let flashIndex = 0
    
    const doFlash = () => {
      if (flashIndex >= totalFlashes) {
        this.tournamentRunning = false
        return
      }
      
      const cellKey = pattern[flashIndex % pattern.length]
      const rect = this.cellRects.get(cellKey)
      
      if (rect) {
        // Flash on
        rect.attr('fill', 'rgba(255,255,255,0.4)')
        
        // Flash off after 50ms
        setTimeout(() => {
          rect.attr('fill', 'rgba(0,0,0,0.3)')
        }, 50)
      }
      
      flashIndex++
      this.flashAnimationId = setTimeout(doFlash, 100) as any
    }
    
    doFlash()
  }
  
  draw(data?: { yomi?: number; strats?: any[]; rounds?: number; currentRound?: number }) {
    this.clear()
    
    const colors = {
      text: '#ffffff',
      labelGrey: '#cfe8ff',
      yellow: '#ffe66d',
      cyan: '#4ecdc4'
    }
    
    // Use passed data or fall back to globals
    const yomiValue = data?.yomi ?? (typeof yomi !== 'undefined' ? yomi : 0)
    const stratsData = data?.strats ?? (typeof strats !== 'undefined' ? strats : [])
    const roundsData = data?.rounds ?? (typeof rounds !== 'undefined' ? rounds : 0)
    const currentRoundData = data?.currentRound ?? (typeof currentRound !== 'undefined' ? currentRound : 0)
    
    // Detect tournament start/stop
    if (currentRoundData === 1 && this.lastCurrentRound === 0 && roundsData > 0) {
      // Tournament just started
      this.tournamentRunning = true
      this.startFlashAnimation(roundsData)
    } else if (currentRoundData >= roundsData && roundsData > 0) {
      // Tournament finished
      this.tournamentRunning = false
      this.cancelFlashAnimation()
    } else if (currentRoundData === 0 && this.lastCurrentRound > 0) {
      // Tournament reset
      this.tournamentRunning = false
      this.cancelFlashAnimation()
    }
    
    this.lastCurrentRound = currentRoundData
    this.lastRounds = roundsData
    
    // Title
    this.svg.append('text')
      .attr('x', 20).attr('y', 30)
      .attr('fill', colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18).attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('STRATEGIC MODELING')
    
    // Tournament status indicator
    if (this.tournamentRunning) {
      this.svg.append('text')
        .attr('x', 350).attr('y', 30)
        .attr('fill', colors.yellow)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 12)
        .text('● RUNNING')
    }
    
    // Yomi display
    this.svg.append('text')
      .attr('x', 450).attr('y', 30)
      .attr('fill', colors.text)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 14)
      .text(`YOMI: ${yomiValue.toLocaleString()}`)
    
    // Strategy buttons
    const strategies = ['RANDOM', 'A100', 'B100', 'GREEDY', 'GENEROUS', 'MINIMAX', 'TIT FOR TAT', 'BEAT LAST']
    const pickerY = 60
    
    this.svg.append('text')
      .attr('x', 20).attr('y', pickerY)
      .attr('fill', colors.labelGrey)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 12)
      .text('SELECT STRATEGY:')
    
    strategies.forEach((strat, i) => {
      const x = 20 + (i % 4) * 140
      const y = pickerY + 20 + Math.floor(i / 4) * 40
      
      const btn = this.svg.append('g').style('cursor', 'pointer')
      
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
    
    // Run/New buttons
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
    
    // Payoff Matrix
    this.drawPayoffMatrix(btnY + 60, colors)
    
    // Tournament Progress
    this.drawTournamentProgress(btnY + 300, colors, stratsData, roundsData, currentRoundData)
  }
  
  private drawButton(x: number, y: number, w: number, h: number, text: string, color: string, onClick: () => void) {
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
  
  private drawPayoffMatrix(startY: number, colors: any) {
    this.svg.append('text')
      .attr('x', 20).attr('y', startY)
      .attr('fill', colors.labelGrey)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 11).text('PAYOFF MATRIX')
    
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
    
    // Get move labels from DOM
    const hLabelA = getVal('hLabela') || 'Move A'
    const hLabelB = getVal('hLabelb') || 'Move B'
    const vLabelA = getVal('vLabela') || 'Move A'
    const vLabelB = getVal('vLabelb') || 'Move B'
    
    // Headers
    this.svg.append('text')
      .attr('x', matrixStartX + cellSize/2).attr('y', matrixStartY - 10)
      .attr('fill', colors.text).attr('font-family', 'Consolas, monospace')
      .attr('font-size', 12).attr('text-anchor', 'middle').text(vLabelA)
    this.svg.append('text')
      .attr('x', matrixStartX + cellSize + cellSize/2).attr('y', matrixStartY - 10)
      .attr('fill', colors.text).attr('font-family', 'Consolas, monospace')
      .attr('font-size', 12).attr('text-anchor', 'middle').text(vLabelB)
    this.svg.append('text')
      .attr('x', matrixStartX - 10).attr('y', matrixStartY + cellSize/2 + 5)
      .attr('fill', colors.text).attr('font-family', 'Consolas, monospace')
      .attr('font-size', 12).attr('text-anchor', 'end').text(hLabelA)
    this.svg.append('text')
      .attr('x', matrixStartX - 10).attr('y', matrixStartY + cellSize + cellSize/2 + 5)
      .attr('fill', colors.text).attr('font-family', 'Consolas, monospace')
      .attr('font-size', 12).attr('text-anchor', 'end').text(hLabelB)
    
    // Cells
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
      
      const rect = this.svg.append('rect')
        .attr('x', x).attr('y', y)
        .attr('width', cellSize).attr('height', cellSize)
        .attr('fill', changed ? 'rgba(255,230,100,0.4)' : 'rgba(0,0,0,0.3)')
        .attr('stroke', 'rgba(255,255,255,0.4)')
      
      // Store rect for flash animation
      this.cellRects.set(cell.key, rect)
      
      if (changed) {
        rect.transition().duration(300).attr('fill', 'rgba(0,0,0,0.3)')
      }
      
      this.svg.append('text')
        .attr('x', x + cellSize/2).attr('y', y + cellSize/2 + 5)
        .attr('fill', colors.text)
        .attr('font-family', 'Consolas, monospace')
        .attr('font-size', 16).attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(`${cell.values[0]}, ${cell.values[1]}`)
    })
    
    this.lastPayoffValues = currentValues
  }
  
  private drawTournamentProgress(startY: number, colors: any, stratsData: any[], roundsData: number, currentRoundData: number) {
    this.svg.append('text')
      .attr('x', 20).attr('y', startY)
      .attr('fill', colors.labelGrey)
      .attr('font-family', 'Consolas, monospace')
      .attr('font-size', 11).text('TOURNAMENT PROGRESS')
    
    // If we have strats data, use it
    if (stratsData && stratsData.length > 0 && roundsData) {
      this.svg.append('text')
        .attr('x', 20).attr('y', startY + 25)
        .attr('fill', colors.text)
        .attr('font-family', 'Consolas, monospace')
        .attr('font-size', 14)
        .text(`Round ${currentRoundData} / ${roundsData}`)
      
      const sorted = [...stratsData].sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0))
      sorted.slice(0, 3).forEach((strat, i) => {
        this.svg.append('text')
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
        this.svg.append('text')
          .attr('x', 20).attr('y', startY + 25)
          .attr('fill', colors.text)
          .attr('font-family', 'Consolas, monospace')
          .attr('font-size', 14)
          .text('RESULTS')
        
        results.slice(0, 3).forEach((result, i) => {
          this.svg.append('text')
            .attr('x', 20).attr('y', startY + 50 + i * 18)
            .attr('fill', colors.text)
            .attr('font-family', 'Consolas, monospace')
            .attr('font-size', 11)
            .text(result)
        })
      } else {
        this.svg.append('text')
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

