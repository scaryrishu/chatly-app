import axios from "axios"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { serverUrl } from "../main.jsx"
import { setUserData } from "../redux/userSlice.js"

const getCurrentUser = () => {
    const dispatch = useDispatch()
    const userData = useSelector(state => state.user.userData)

    useEffect(() => {
        // Skip fetch if userData already exists (from persisted storage)
        if (userData) return

        const fetchUser = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/user/current`,
                    { withCredentials: true }
                )
                dispatch(setUserData(result.data))
            } catch (error) {
                // 400 here just means "not logged in yet" — expected, no need to log
                if (error?.response?.status !== 400) {
                    console.log("Error fetching user:", error)
                }
            }
        }

        fetchUser()
    }, [dispatch]) // Only depend on dispatch

    return userData
}

export default getCurrentUser