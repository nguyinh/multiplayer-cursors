import { createRoot } from "react-dom/client";
import "./index.css";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";

// import MultiCursorCanvas from "./components/MultiCursorCanvas.tsx";
import { AuthGuard, AuthProvider } from "./contexts/AuthContext.tsx";
import { SocketProvider } from "./contexts/SocketContext.tsx";
// import RealtimeCursors from "./pages/RealtimeCursors.tsx";
import CardBattle from "./pages/CardBattle.tsx";
import GameLobby from "./pages/GameLobby.tsx";
import Home from "./pages/Home.tsx";
import Identification from "./pages/Identification.tsx";

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
						<Route path="/card-battle">
							<Route path="new" element={<GameLobby />} />

							<Route
								path=":roomId"
								element={
									<SocketProvider>
										<Outlet />
									</SocketProvider>
								}
							>
								<Route path="lobby" element={<GameLobby />} />
								<Route path="game" element={<CardBattle />} />
							</Route>
						</Route>
					</Routes>
				</AuthGuard>
			</AuthProvider>
		</NuqsAdapter>
	</BrowserRouter>,
);
