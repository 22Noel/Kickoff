import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import MatchComponent from "./components/Match";
import Profile from "./components/Profile";
import Leagues from "./components/Leagues";
import JoinMatch from './components/JoinMatch';
import Browse from "./components/Browse";
import Career from "./components/Career";

function AppRouter() {
    return (
        <>
            <Routes>
                <Route path="/auth" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/leagues" element={<Leagues />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/career" element={<Career />} />
                    <Route path="/matches/:id" element={<MatchComponent/>} />
                    <Route path="/matches/join/:code" element={<JoinMatch />} />
                </Route>
                <Route path="*" element={<Home />} />
            </Routes>
        </>
    )
}

export default AppRouter;