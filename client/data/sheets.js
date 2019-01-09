const labels = {
  qualityMeasures: 'D16',
  healthInspection: 'D17',
  staffing: 'D18',
  overall: 'D19',
  overallRating1: 'D24',
  overallRating2: 'E24',
  overallRating3: 'F24',
  overallRating4: 'G24',
  overallRating5: 'H24',
  currentCnaPPD: 'D29',
  currentLpnPPD: 'E29',
  currentRnPPD: 'F29',
  currentPPDTotal: 'G29',
  currentCnaEmp: 'D30',
  currentLpnEmp: 'E30',
  currentRnEmp: 'F30',
  totalEmp: 'G30',
  twoReqCnaPPD: 'D35',
  twoReqLpnPPD: 'E35',
  twoReqRnPPD: 'F35',
  twoReqTotalPPD: 'G35',
  twoReqCnaInc: 'D36',
  twoReqLpnInc: 'E36',
  twoReqRnInc: 'F36',
  twoReqTotalInc: 'G36',
  twoReqCnaEmp: 'D38',
  twoReqLpnEmp: 'E38',
  twoReqRnEmp: 'F38',
  twoReqTotalEmp: 'G38',
  twoReqCnaEmpInc: 'D39',
  twoReqLpnEmpInc: 'E39',
  twoReqRnEmpInc: 'F39',
  twoReqTotalEmpInc: 'G39',
  twoStarAddMonth: 'G40',
  twoStarAddPPD: 'G41',
  threeReqCnaPPD: 'D43',
  threeReqLpnPPD: 'E43',
  threeReqRnPPD: 'F43',
  threeReqTotalPPD: 'G43',
  threeReqCnaInc: 'D44',
  threeReqLpnInc: 'E44',
  threeReqRnInc: 'F44',
  threeReqTotalInc: 'G44',
  threeReqCnaEmp: 'D46',
  threeReqLpnEmp: 'E46',
  threeReqRnEmp: 'F46',
  threeReqTotalEmp: 'G46',
  threeReqCnaEmpInc: 'D47',
  threeReqLpnEmpInc: 'E47',
  threeReqRnEmpInc: 'F47',
  threeReqTotalEmpInc: 'G47',
  threeStarAddMonth: 'G48',
  threeStarAddPPD: 'G49',
  fourReqCnaPPD: 'D51',
  fourReqLpnPPD: 'E51',
  fourReqRnPPD: 'F51',
  fourReqTotalPPD: 'G51',
  fourReqCnaInc: 'D52',
  fourReqLpnInc: 'E52',
  fourReqRnInc: 'F52',
  fourReqTotalInc: 'G52',
  fourReqCnaEmp: 'D54',
  fourReqLpnEmp: 'E54',
  fourReqRnEmp: 'F54',
  fourReqTotalEmp: 'G54',
  fourReqCnaEmpInc: 'D55',
  fourReqLpnEmpInc: 'E55',
  fourReqRnEmpInc: 'F55',
  fourReqTotalEmpInc: 'G55',
  fourStarAddMonth: 'G56',
  fourStarAddPPD: 'G57',
  latestPeriod: 'I16',
};
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports.offsetLabel = 'B15';

// Only works with "A1" format, not "A$1", "AA1", etc.
const idxsByLabel = function(label, offsetLabel){
  const re = /([A-Z]{1,2})([0-9]{1,3})/;
  const groups = offsetLabel.match(re);
  if(groups.length < 3) {
    throw "Couldn't find a match";
  }
  const baseCol = alphabet.indexOf(groups[1]);
  const baseRow = parseInt(groups[2]);
  const labelGroups = label.match(re);
  if(labelGroups.length < 3) {
    throw "Couldn't find a match";
  }
  const labelCol = alphabet.indexOf(labelGroups[1]);
  const labelRow = parseInt(labelGroups[2]);

  const adjRow = labelRow - baseRow;
  const adjCol = labelCol - baseCol;

  return [adjRow, adjCol];
};

module.exports.getCellVal = function(cells, offset){
  return function(key){
    const [row, col] = idxsByLabel(labels[key], offset);
    return cells[row][col];
  };
};

module.exports.getCellIndexColumn = function(column){
  return column.charCodeAt(0) - "A".charCodeAt(0) - 1;
}
module.exports.getCellIndexRow = function(row){
  return row - 15;
}

module.exports.idxsByLabel = idxsByLabel;
