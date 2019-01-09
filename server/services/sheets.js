
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const FormulaParser = require('hot-formula-parser').Parser;
// Returns the fully evaluated value of one cell

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports.authWithGoogle = async () => {
    const key = JSON.parse(process.env.INV360_PRIVATE_JSON);
    const auth = new JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
    );

    await auth.authorize();

    console.log("Authenticated with Google");

    return auth;
};

module.exports.getSpreadsheet = (auth) => {
  const sheets = google.sheets({version: 'v4', auth});

  return new Promise((resolve, reject) => {
    sheets.spreadsheets.get({spreadsheetId: process.env.INV360_SPREADSHEET_ID, ranges: ['A1:Z160'], includeGridData: true}, (err, res) => {
      if(err) {
        reject(err)
      }
      else {
        const rawRowData = res.data.sheets[0].data[0].rowData;
        const processedRD = rawRowData.map(row => {
          return row.values.map(cell => {
            const { userEnteredValue, effectiveValue } = cell;
            if(userEnteredValue && effectiveValue) {
              return {
                isEmpty: false,
                userEnteredValue,
                effectiveValue,
              };
            }
            return { isEmpty: true };
          });
        });
        resolve(processedRD);
      }
    })
  });
};


class Range {
  constructor(cells, startCellCoord, endCellCoord) {
    const [startRow, startCol] = startCellCoord;
    const [endRow, endCol] = endCellCoord;
    const fragment = [];
    let row = startRow;
    for (row; row <= endRow; row++) {
      const rowData = cells[row];
      const colFragment = [];

      let col = startCol;
      for (col; col <= endCol; col++) {
        colFragment.push(new Cell(rowData[col]));
      }
      fragment.push(colFragment);
    }

    return this.cells = fragment;
  }

  map(fn) {
    return this.cells.map(fn);
  }
}

class Cell {
  constructor(cell) {
    this.cell = cell;
  }

  getValue() {
    const userEnteredValue = this.cell.userEnteredValue;
    if(userEnteredValue) {
      if(typeof userEnteredValue.numberValue !== 'undefined') {
        return userEnteredValue.numberValue;
      }
      if(typeof userEnteredValue.stringValue !== 'undefined') {
        return userEnteredValue.stringValue;
      }
    }
    return 0;
  }

  getFormula() {
    const userEnteredValue = this.cell.userEnteredValue;
    if(userEnteredValue) return userEnteredValue.formulaValue;
  }

  getCalculated() {
    return this.cell.calculated;
  }
}

// A stateful representation of the entire block of cells
class SpreadSheet {
  constructor(cells) {
    this.cells = cells;
  }

  // Convert 'A1' and 'B3:C10' to row / column indices
  addrToIdx(addr) {
    // const split = addr.split(':');
    // if(split.length > 1) { // Range of vals
    //   return [this.addrToIdx(split[0]), this.addrToIdx(split[1])];
    // }
    const row = parseInt(addr[1]) + 1;
    const col = alphabet.indexOf(addr[0]) + 1;
    return [row, col];
  }

  replaceCell(cellAddress, value) {
    const idxs = this.addrToIdx(cellAddress);
    this.cells[idxs[0]][idxs[1]] = value;
  }

  getCell(row, col) {
    // If a formula, return false
    return new Cell(this.cells[row][col]);
  }

  // Tuples of row, col -> array of arrays of
  getRange(startCellCoord, endCellCoord) {
    return new Range(this.cells, startCellCoord, endCellCoord);
  }

  evaluate(cellAddress) {
    const [row, col] = this.addrToIdx(cellAddress);
    const cell = this.cells[row][col];
    const formula = this.getFormula(cell);
    if(formula) {
      // Identify all precedents
      console.log(formula);
    }
    else {
      return cell.value;
    }
  }
}

const evaluateCell = (parser, spreadsheet, cellLabel) => {
  const [row, col] = parser.parse(cellLabel);
  const cell = spreadsheet.getCell(row, col);
  const calculated = cell.getCalculated();
  let value;
  if(calculated) {
    return calculated;
  }
  const formula = cell.getFormula()
  if(formula) {
    value = evaluateCell(parser, spreadsheet, formula);
  }
  else {
    value = cell.getValue();
  }
  cell.setCalculated(value);
  return value;
};

// Takes in cells, inputs, data
// Returns list of targetCells populated with computed values
module.exports.evaluateAll = ({cells, inputs, data}) => {
  // Input all "known" values (inputs and data)
  // Map input values to cells
  const ss = new SpreadSheet(cells);

  const inputsToCells = {
    cnaSalary: 'D6',
    lpnSalary: 'E6',
    rnSalary: 'F6',
    cnaBenefits: 'D7',
    lpnBenefits: 'E7',
    rnBenefits: 'F7',
    pto: 'G8',
    mealBreak: 'G9',
    cnaAdmin: 'D10',
    lpnAdmin: 'E10',
    rnAdmin: 'F10',
    census: 'G12',
  };

  // Replace relevant cells with inputs
  Object.keys(inputsToCells).forEach(key => {
    const value = inputs[key];
    // Find where to place data
    ss.replaceCell(inputsToCells[key], value);
  });

  const [staffingData, starData] = data;
  console.log(staffingData, starData);

  staffingData.cnaHPD = staffingData.repCnaHPD;
  staffingData.lpnHPD = staffingData.repLpnHPD;
  staffingData.rnHPD = staffingData.repRnHPD;
  staffingData.totalHPD = staffingData.repTotalHPD;
  staffingData.exCnaHPD = staffingData.expCnaHPD;
  staffingData.exLpnHPD = staffingData.expLpnHPD;
  staffingData.exRnHPD = staffingData.expRnHPD;
  staffingData.exTotalHPD = staffingData.expTotalHPD;

  starData.QMRating = starData.qmRating;

  // const staffingData = {
  //   staffingRating: 3,
  //   rnStaffingRating: 3,
  //   providerName: 'Nebraska Skilled Nursing & Rehab',
  //   cnaHPD: 2.44,
  //   lpnHPD: 0.815,
  //   rnHPD: .639,
  //   totalHPD: 3.892,
  //   exCnaHPD: 2.106,
  //   exLpnHPD: .839,
  //   exRnHPD: .440,
  //   exTotalHPD: 3.385,
  //   adjCnaHPD: 2.418,
  //   adjLpnHPD: .737,
  //   adjRnHPD: .553,
  //   adjTotalHPD: 3.712,
  //   processingDay: '6/1/2018',
  // };

  const labelToStaffingData = {
    'B1': 'providerName',
    'D1': 'staffingRating',
    'F1': 'rnStaffingRating',
    'J1': 'cnaHPD',
    'K1': 'lpnHPD',
    'L1': 'rnHPD',
    'N1': 'totalHPD',
    'P1': 'exCnaHPD',
    'Q1': 'exLpnHPD',
    'R1': 'exRnHPD',
    'S1': 'exTotalHPD',
    'T1': 'adjCnaHPD',
    'U1': 'adjLpnHPD',
    'V1': 'adjRnHPD',
    'W1': 'adjTotalHPD',
  };

  // const starData = {
  //   providerName: 'Nebraska Skilled Nursing & Rehab',
  //   overallRating: 2,
  //   healthInspectionRating: 1,
  //   QMRating: 5,
  //   staffingRating: 3,
  //   rnStaffingRating: 3,
  // };

  const labelToStarData = {
    'B1': 'providerName',
    'D1': 'overallRating',
    'F1': 'healthInspectionRating',
    'H1': 'QMRating',
    'J1': 'staffingRating',
    'L1': 'rnStaffingRating',
  };

  // Find target cells in grid
  const parser = new FormulaParser();

  parser.setFunction('VLOOKUP', function(params) {
    const [searchKey, range, index, sorted = false] = params;
    // Searches down the first column of a range for a key and returns the value of a specified cell
    const row = range.find(row => {
      return row[0] === searchKey;
    });

    if(row) {
      return row[index - 1]; // Convert to zero indexed
    }
    else if(sorted) {
      return range[0][index];
    }
  });

  const externalRefs = (formula) => {
    const sheetNames = ['Staffing data', 'Star rating'];
    // If external reference, resolve from hashmap
    sheetNames.forEach(sn => {
      const re = new RegExp("'" + sn + "'!([A-Z]{0,3}[0-9]{1,})", 'g');
      formula = formula.replace(re, function(match, label) {
        if(label) {
          if(sn === 'Staffing data') {
            const key = labelToStaffingData[label];
            return staffingData[key];
          }
          else if(sn === 'Star rating') {
            const key = labelToStarData[label];
            return starData[key];
          }
        }
      });
    });
    return formula;
  };

  const evaluateCell = (cell, done) => {
    const calculated = cell.getCalculated();

    if(calculated !== null) {
      done(calculated);
    }

    let formula = cell.getFormula();

    if(typeof formula !== 'undefined') {
      formula = formula.substr(1); // Strip away equals sign

      formula = externalRefs(formula);

      done(parser.parse(formula).result);
    }
    else {
      done(cell.getValue(cell));
    }
  };

  parser.on('callCellValue', (cellCoord, done) => {
    // check to see values at row
    const cell = ss.getCell(cellCoord.row.index, cellCoord.column.index);
    evaluateCell(cell, done);
  });

  parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
    let range = ss.getRange([startCellCoord.row.index,startCellCoord.column.index], [endCellCoord.row.index,endCellCoord.column.index]);
    if (range) {
      const evaluatedRange = range.map(row => {
        return row.map(cell => {
          const calculated = cell.getCalculated();
          let formula = cell.getFormula();
          const value = cell.getValue();
          if(calculated !== null && typeof calculated !== 'undefined') {
            return calculated;
          }
          if(typeof formula !== 'undefined') {
            formula = formula.substr(1); // Strip away equals sign

            formula = externalRefs(formula);

            return parser.parse(formula).result;
          }
          else {
            return value;
          }
        });
      });

      done(evaluatedRange);
    }
  });

  return parser.parse('B15:K57'); // Range of analysis cells
};
