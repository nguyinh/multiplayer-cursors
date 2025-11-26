// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { BrowserRouter, Route, Routes } from "react-router";
import MultiCursorCanvas from "./components/MultiCursorCanvas.tsx";
import { AuthGuard, AuthProvider } from "./contexts/AuthContext.tsx";
import GameLobby from "./pages/GameLobby.tsx";
import Home from "./pages/Home.tsx";
import Identification from "./pages/Identification.tsx";
import RealtimeCursors from "./pages/RealtimeCursors.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<BrowserRouter>
		<NuqsAdapter>
			<AuthProvider>
				<AuthGuard>
					<Routes>
						<Route path="/" element={<Home />} />

						<Route path="/identify" element={<Identification />} />

						{/* <Route path="/realtime-cursors" element={<RealtimeCursors />} /> */}
						<Route path="/realtime-cursors">
							<Route index element={<MultiCursorCanvas emulateWS />} />
							<Route path=":roomId/lobby" element={<GameLobby />} />
							<Route path=":roomId/game" element={<RealtimeCursors />} />
							<Route path="new" element={<GameLobby />} />
						</Route>
					</Routes>
				</AuthGuard>
			</AuthProvider>
		</NuqsAdapter>
	</BrowserRouter>,
);
