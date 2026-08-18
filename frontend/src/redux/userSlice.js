import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
    },
    reducers: {  // states ka data change karne ke lie
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        clearUserData: (state) => {
            state.userData = null;
        }
    }
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;