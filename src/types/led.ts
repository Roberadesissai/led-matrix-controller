// src/types/led.ts
export interface LEDColumn {
    columnId: number;
    isOn: boolean;
  }
  
  export interface LEDRow {
    rowId: number;
    columns: LEDColumn[];
  }
  
  export interface LEDPattern {
    name?: string;
    timestamp?: string;
    rows: LEDRow[];
  }
  
  export interface SavedPattern extends LEDPattern {
    name: string;
    timestamp: string;
  }
  
  // Convert between matrix and JSON format
  export const matrixToPattern = (activeLeds: Set<number>): LEDPattern => {
    const rows: LEDRow[] = [];
    
    for (let rowId = 0; rowId < 8; rowId++) {
      const columns: LEDColumn[] = [];
      for (let colId = 0; colId < 20; colId++) {
        const index = rowId % 2 === 0 
          ? (rowId * 20) + (19 - colId)
          : (rowId * 20) + colId;
        columns.push({
          columnId: colId,
          isOn: activeLeds.has(index)
        });
      }
      rows.push({ rowId, columns });
    }
    
    return {
      name: `Pattern ${new Date().toLocaleString()}`,
      timestamp: new Date().toISOString(),
      rows
    };
  };
  
  export const patternToMatrix = (pattern: LEDPattern): Set<number> => {
    const activeLeds = new Set<number>();
    
    pattern.rows.forEach((row) => {
      row.columns.forEach((col) => {
        if (col.isOn) {
          const index = row.rowId % 2 === 0
            ? (row.rowId * 20) + (19 - col.columnId)
            : (row.rowId * 20) + col.columnId;
          activeLeds.add(index);
        }
      });
    });
    
    return activeLeds;
  };