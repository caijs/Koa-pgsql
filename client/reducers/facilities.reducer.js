const initialState = {
  selected: {},
  facilities: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'CLEAR_ALL': {
      return { ...initialState};
    }
    case 'SELECT_FACILITY': {
      return Object.assign({}, state, { selected: action.facility });
    }
    case 'CLEAR_FACILITY': {
      return {...state, selected: initialState.selected};
    }
    case 'LOAD_FACILITIES': {
      return { ...state, facilities: action.facilities };
    }
    default:
      return state;
  }
}
