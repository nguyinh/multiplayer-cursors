import { useQueryState } from "nuqs";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

interface AuthContextType {
	username: string | null;
	setNuqsUsername: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [username, setNuqsUsername] = useQueryState("username");

	// biome-ignore lint/correctness/useExhaustiveDependencies: Don't need to re-run on other deps
	useEffect(() => {
		if (username && location.pathname === "/identify") {
			navigate("/");
			setNuqsUsername(username);
		}
	}, [location.pathname]);

	return (
		<AuthContext.Provider value={{ username, setNuqsUsername }}>
			{children}
		</AuthContext.Provider>
	);
};

export function AuthGuard({ children }: { children: ReactNode }) {
	const { username } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!username) {
			navigate("/identify");
		}
	}, [username, navigate]);

	return <>{children}</>;
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};
