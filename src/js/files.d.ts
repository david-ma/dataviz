import { d3 } from './chart'
type Filestatus = 'keep' | 'delete' | 'mixed'
type FileNode = {
  filesize: number
  rsync?: string
  timestamp: string
  path: string
  name: string
  filetype: string
  filestatus: Filestatus
}
type ElementWithDatum<Datum> = d3.Selection<
  d3.BaseType,
  Datum,
  HTMLElement,
  any
>
export declare function drawDirs(
  selection: ElementWithDatum<d3.HierarchyNode<FileNode>>,
): void
export {}
