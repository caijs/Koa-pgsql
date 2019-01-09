const initialState = {
  fetched: false,
  data: [],
};

export default (state = initialState, action) => {
  switch(action.type) {
    case 'CLEAR_ALL': {
      return { ...initialState };
    }
    case 'LOAD_USERS': {
      return { ...state, data: action.users };
    }
    case 'LOAD_USER': {
      const data = [].concat(state.data);
      data.push(action.user);
      return { ...state, data};
    }
    case 'UPDATE_USER': {
      const data = [].concat(state.data);
      const indexToReplace = data.findIndex(u => u.id === action.id);
      if(indexToReplace > -1) {
        data[indexToReplace] = { ...action.user, id: action.id };
      }
      return { ...state, data };
    }
    case 'DELETE_USER': {
      const userId = action.id;
      const data = [].concat(state.data);
      const indexToRemove = data.findIndex(u => u.id === userId);
      if(indexToRemove > -1) {
        data.splice(indexToRemove, 1);
      }
      return { ...state, data };
    }
    default: {
      return state;
    }
  }
};
