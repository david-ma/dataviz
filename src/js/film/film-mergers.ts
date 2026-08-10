export type SankeyNode = {
  name: string
  category: string
}

export type SankeyLink = {
  source: string
  target: string
  value: number
  year: number
  label?: string
}

export type SankeyData = {
  nodes: SankeyNode[]
  links: SankeyLink[]
  notes: string[]
}

export const filmMergers: SankeyData = {
  nodes: [
    { name: 'Netflix', category: 'Streaming' },
    { name: 'Warner Bros. Discovery', category: 'Studio' },
    { name: 'HBO', category: 'Network' },
    { name: 'Discovery+', category: 'Streaming' },
    { name: 'AT&T', category: 'Telecom' },
    { name: 'AOL', category: 'Telecom' },
    { name: 'Time Warner', category: 'Studio' },
    { name: 'Disney', category: 'Studio' },
    { name: '21st Century Fox', category: 'Studio' },
    { name: 'Sony', category: 'Studio' },
    { name: 'Columbia Pictures', category: 'Studio' },
    { name: 'NBCUniversal', category: 'Media' },
    { name: 'Comcast', category: 'Telecom' },
    { name: 'General Electric', category: 'Industrial' },
    { name: 'Pixar', category: 'Studio' },
    { name: 'Marvel', category: 'Studio' },
    { name: 'Lucasfilm', category: 'Studio' },
    { name: 'Viacom', category: 'Media' },
    { name: 'Paramount Global', category: 'Media' },
    { name: 'Universal', category: 'Studio' },
    { name: 'Paramount Pictures', category: 'Studio' },
  ],
  links: [
    {
      source: 'Sony',
      target: 'Columbia Pictures',
      value: 3.4,
      year: 1989,
      label: 'Sony → Columbia ($3.4B, 1989)',
    },
    {
      source: 'AOL',
      target: 'Time Warner',
      value: 147,
      year: 2001,
      label: 'AOL ↔ Time Warner ($147B, 2001)',
    },
    {
      source: 'AT&T',
      target: 'Time Warner',
      value: 85,
      year: 2018,
      label: 'AT&T → Time Warner ($85B, 2018)',
    },
    {
      source: 'Discovery+',
      target: 'Warner Bros. Discovery',
      value: 43,
      year: 2022,
      label: 'Discovery + WarnerMedia ($43B, 2022)',
    },
    {
      source: 'Time Warner',
      target: 'HBO',
      value: 15,
      year: 2010,
      label: 'Time Warner → HBO (existing ownership)',
    },
    {
      source: 'Warner Bros. Discovery',
      target: 'HBO',
      value: 15,
      year: 2022,
      label: 'HBO folds into WBD (2022)',
    },
    {
      source: 'Netflix',
      target: 'Warner Bros. Discovery',
      value: 70,
      year: 2025,
      label: 'Netflix → WBD ($70B, announced)',
    },
    {
      source: 'Disney',
      target: '21st Century Fox',
      value: 71.3,
      year: 2019,
      label: 'Disney → 21CF ($71.3B, 2019)',
    },
    {
      source: 'Disney',
      target: 'Pixar',
      value: 7.4,
      year: 2006,
      label: 'Disney → Pixar ($7.4B, 2006)',
    },
    {
      source: 'Disney',
      target: 'Marvel',
      value: 4,
      year: 2009,
      label: 'Disney → Marvel ($4B, 2009)',
    },
    {
      source: 'Disney',
      target: 'Lucasfilm',
      value: 4.05,
      year: 2012,
      label: 'Disney → Lucasfilm ($4.05B, 2012)',
    },
    {
      source: 'General Electric',
      target: 'NBCUniversal',
      value: 3.8,
      year: 2004,
      label: 'GE forms NBCUniversal (2004, $3.8B cash + assets)',
    },
    {
      source: 'NBCUniversal',
      target: 'Universal',
      value: 0,
      year: 2004,
      label: 'NBCUniversal controls Universal Pictures (2004)',
    },
    {
      source: 'Comcast',
      target: 'NBCUniversal',
      value: 16.7,
      year: 2013,
      label: 'Comcast completes NBCU buy ($16.7B, 2013)',
    },
    {
      source: 'Viacom',
      target: 'Paramount Pictures',
      value: 10,
      year: 1994,
      label: 'Viacom → Paramount ($10B, 1994)',
    },
    {
      source: 'Paramount Global',
      target: 'Paramount Pictures',
      value: 0,
      year: 2019,
      label: 'ViacomCBS rebrands to Paramount Global (2019)',
    },
  ],
  notes: [
    'Telecommunications Act of 1996 deregulated U.S. media ownership limits, encouraging telecom-media consolidation.',
    'Values are USD billions; Netflix → WBD marked as announced.',
  ],
}

