import { createContext, FC, ReactNode, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { IUser, TFunction } from "~/types";
import { lsKeys, lStorage } from "~/utils/local-storage";

interface AuthContextData {
    authUser: IUser;
    authToken: string;
    signOut: (callback?: TFunction) => void;
    saveAuthUser: (user: IUser, token: string) => void;
}

const AuthContext = createContext<AuthContextData | null>(null);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { from } = location.state || {
        from: {
            pathname: "/dashboard",
        },
    };

    function signOut(callback?: TFunction) {
        lStorage.setValues({
            [lsKeys.AUTH_TOKEN]: null,
            [lsKeys.AUTH_USER]: null,
        });

        if (callback && typeof callback === "function") {
            callback();
        }
        navigate("/login", {
            state: {
                from: location.pathname,
            },
        });
    }

    const saveAuthUser = async (user: object, token: string) => {
        lStorage.setValues({
            [lsKeys.AUTH_TOKEN]: token,
            [lsKeys.AUTH_USER]: user,
        });
        return navigate(from);
    };

    const value = {
        authUser: lStorage.getValue(lsKeys.AUTH_USER),
        authToken: lStorage.getValue(lsKeys.AUTH_TOKEN),
        saveAuthUser,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export default AuthProvider;

export function useAuth(): AuthContextData {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return authContext;
}
