import { useNavigate } from "react-router";
import { Header } from "../components/header";
import { Inputbar } from "../components/input-bar";
import { useTheme } from "../providers/theme";
import { useCallback } from "react";

export function HomeScreen(){
  const navigate = useNavigate();
  const handleSubmit = useCallback((text: string)=>{
    navigate("/sessions/new", {state: {message: text}})
  },[navigate])

  const {theme} = useTheme()
  return (
    <box
      alignItems="center"
      justifyContent="center"
      backgroundColor={theme.background}
      width="100%"
      height="100%"
      gap={2}
    >
      <Header />
      <box width="100%" maxWidth={78} paddingX={2}>
        <Inputbar onSubmit={handleSubmit} />
      </box>
    </box>
  );
}