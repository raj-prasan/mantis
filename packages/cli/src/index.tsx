import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { RootLayout } from "./layouts/root-layout";
import {createMemoryRouter, RouterProvider} from "react-router"
import { HomeScreen } from "./screens/home";
import { NewSession } from "./screens/new-session";
import { Session } from "./screens/session";

const router = createMemoryRouter([
  {
    path: "/",
    element : <RootLayout/>,
    children : [
      {index: true, element: <HomeScreen/>},
      {path: "sessions/new", element: <NewSession/>},
      {path: "sessions/:id", element: <Session/>},
    ]
  }
])

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  targetFps: 60,
});
createRoot(renderer).render(<App />);
